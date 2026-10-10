import { sectionTitle } from "@/lib/resume/defaults";
import { linkDisplay, linkHref } from "@/lib/resume/links";
import type { Item, Language, ResumeContent, Section } from "@/lib/resume/schema";
import { LinkIcon } from "./link-icon";

const lines = (value: string) => value.split("\n").map(line => line.trim()).filter(Boolean);

export function CvHeader({ content }: { content: ResumeContent }) {
  const links = content.links.filter(link => link.visible && link.value.trim());
  return (
    <header className="cv-header">
      <h1 className="cv-name">{content.personal.fullName || "Nama Lengkap"}</h1>
      {content.personal.headline.trim() && <p className="cv-headline">{content.personal.headline}</p>}
      {links.length > 0 && (
        <div className="cv-contacts">
          {links.map(link => {
            const href = linkHref(link);
            const body = (
              <>
                <LinkIcon type={link.type} />
                <span>{linkDisplay(link)}</span>
              </>
            );
            return href ? (
              <a key={link.id} href={href} target="_blank" rel="noreferrer">
                {body}
              </a>
            ) : (
              <span key={link.id} className="cv-contact">
                {body}
              </span>
            );
          })}
        </div>
      )}
    </header>
  );
}

function Bullets({ text }: { text: string }) {
  const items = lines(text);
  if (items.length === 0) return null;
  return (
    <ul className="cv-bullets">
      {items.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}

function Row({ title, date }: { title: string; date: string }) {
  if (!title && !date) return null;
  return (
    <div className="cv-row">
      <span className="cv-title">{title}</span>
      {date && <span className="cv-date">{date}</span>}
    </div>
  );
}

export function CvItem({ section, item }: { section: Section; item: Item }) {
  switch (section.type) {
    case "skills":
      return (
        <p className="cv-skill">
          {item.title && <strong>{item.title}: </strong>}
          {item.detail}
        </p>
      );
    case "achievements":
      return <p className="cv-list-item">{item.title}</p>;
    case "summary":
      return <p className="cv-summary">{item.detail}</p>;
    case "education":
      return (
        <div className="cv-item">
          <Row title={item.title} date={item.date} />
          {item.detail && <p className="cv-detail cv-italic">{item.detail}</p>}
        </div>
      );
    case "projects": {
      const href = item.subtitle ? linkHref({ id: item.id, type: "website", value: item.subtitle, visible: true }) : null;
      return (
        <div className="cv-item">
          <Row title={item.title} date={item.date} />
          {item.detail && <p className="cv-detail cv-italic">{item.detail}</p>}
          {item.subtitle && (
            <p className="cv-subtitle cv-link">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
                  {item.subtitle.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                item.subtitle
              )}
            </p>
          )}
          <Bullets text={item.bullets} />
        </div>
      );
    }
    default:
      return (
        <div className="cv-item">
          <Row title={item.title} date={item.date} />
          {item.subtitle && <p className="cv-subtitle">{item.subtitle}</p>}
          <Bullets text={item.bullets} />
        </div>
      );
  }
}

export function CvSectionStart({ section, item, language }: { section: Section; item: Item; language: Language }) {
  return (
    <div className="cv-section-start">
      <h2 className="cv-section-title">{sectionTitle(section, language)}</h2>
      <CvItem section={section} item={item} />
    </div>
  );
}
