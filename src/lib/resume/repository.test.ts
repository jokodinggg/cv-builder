import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createBlankContent } from "./defaults";

const hasDb = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!hasDb)("resume repository ownership", async () => {
  const { prisma } = await import("@/lib/db");
  const repo = await import("./repository");
  const userA = `test-a-${Date.now()}`;
  const userB = `test-b-${Date.now()}`;

  beforeAll(async () => {
    for (const id of [userA, userB]) {
      await prisma.user.create({ data: { id, name: id, email: `${id}@test.local` } });
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
    await prisma.$disconnect();
  });

  it("lets only the owner read, update, and delete a resume", async () => {
    const created = await repo.createResume(userA, { title: "CV A", language: "id", content: createBlankContent("id") });

    expect(await repo.getResume(userB, created.id)).toBeNull();
    expect(await repo.updateResume(userB, created.id, { title: "hacked" })).toBe(false);
    expect(await repo.deleteResume(userB, created.id)).toBe(false);
    expect((await repo.listResumes(userB)).map(resume => resume.id)).not.toContain(created.id);

    const mine = await repo.getResume(userA, created.id);
    expect(mine?.title).toBe("CV A");
    expect(await repo.updateResume(userA, created.id, { title: "CV A2" })).toBe(true);
    expect((await repo.listResumes(userA))[0]).toMatchObject({ id: created.id, title: "CV A2" });
    expect(await repo.deleteResume(userA, created.id)).toBe(true);
    expect(await repo.getResume(userA, created.id)).toBeNull();
  });

  it("refuses the 11th resume for one user", async () => {
    const limitUser = `test-limit-${Date.now()}`;
    await prisma.user.create({ data: { id: limitUser, name: limitUser, email: `${limitUser}@test.local` } });
    try {
      for (let i = 0; i < repo.MAX_RESUMES_PER_USER; i++) {
        await repo.createResume(limitUser, { title: `CV ${i}`, language: "id", content: createBlankContent("id") });
      }
      await expect(
        repo.createResume(limitUser, { title: "CV 11", language: "id", content: createBlankContent("id") }),
      ).rejects.toBeInstanceOf(repo.ResumeLimitError);
      expect(await repo.countResumes(limitUser)).toBe(10);
    } finally {
      await prisma.user.delete({ where: { id: limitUser } });
    }
  });

  it("lets only one of two concurrent creates through when one slot is left", async () => {
    const raceUser = `test-race-${Date.now()}`;
    await prisma.user.create({ data: { id: raceUser, name: raceUser, email: `${raceUser}@test.local` } });
    try {
      for (let i = 0; i < repo.MAX_RESUMES_PER_USER - 1; i++) {
        await repo.createResume(raceUser, { title: `CV ${i}`, language: "id", content: createBlankContent("id") });
      }
      const results = await Promise.allSettled(
        [1, 2].map(n => repo.createResume(raceUser, { title: `race ${n}`, language: "id", content: createBlankContent("id") })),
      );
      expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
      expect(await repo.countResumes(raceUser)).toBe(10);
    } finally {
      await prisma.user.delete({ where: { id: raceUser } });
    }
  });

  it("returns blank content when the stored JSON is malformed", async () => {
    const row = await prisma.resume.create({ data: { userId: userA, title: "broken", content: { nope: 1 } } });
    const loaded = await repo.getResume(userA, row.id);
    expect(loaded?.content.schemaVersion).toBe(1);
  });
});
