import Photo from "../../experience-kit/Photo.jsx";
import { initial } from "./format.js";

/** Equipo de trabajo: foto redonda, nombre y cargo de cada integrante. */
export default function Team({ team = [], className = "" }) {
  const members = team.filter((m) => m?.name);
  if (!members.length) return null;
  return (
    <ul className={`pk-team ${className}`}>
      {members.map((member, i) => (
        <li key={`${member.name}-${i}`} className="pk-member">
          <span className="pk-member__photo">
            {member.photo?.src ? <Photo image={member.photo} sizes="(min-width: 760px) 180px, 40vw" alt={member.name} /> : <span className="pk-member__initial">{initial(member.name)}</span>}
          </span>
          <p className="pk-member__name">{member.name}</p>
          {member.role && <p className="pk-member__role">{member.role}</p>}
        </li>
      ))}
    </ul>
  );
}
