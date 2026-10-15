function svg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">${body}</svg>`;
}

const frame = `<rect x="3" y="4" width="26" height="20" fill="#c0c0c0" stroke="#000"/>`;

export const ICONS: Record<string, string> = {
  about: svg(
    `${frame}<rect x="6" y="7" width="20" height="12" fill="#000080"/><rect x="13" y="24" width="6" height="3" fill="#808080"/><rect x="8" y="27" width="16" height="2" fill="#000"/>`,
  ),
  jobs: svg(
    `<rect x="4" y="12" width="24" height="14" fill="#8b5a2b" stroke="#000"/><rect x="11" y="8" width="10" height="5" fill="#c0c0c0" stroke="#000"/><rect x="13" y="16" width="6" height="3" fill="#ffd200" stroke="#000"/>`,
  ),
  projects: svg(
    `<path d="M3 10 h10 l2 2 h14 v14 h-26 z" fill="#ffd200" stroke="#000"/><path d="M3 13 h26" stroke="#e0b000"/>`,
  ),
  skills: svg(
    `<rect x="6" y="8" width="20" height="16" fill="#008080" stroke="#000"/><rect x="9" y="11" width="4" height="4" fill="#c0c0c0"/><rect x="15" y="11" width="4" height="4" fill="#c0c0c0"/><rect x="21" y="11" width="2" height="4" fill="#c0c0c0"/><rect x="9" y="17" width="14" height="2" fill="#000080"/>`,
  ),
  radio: svg(
    `<rect x="5" y="14" width="22" height="12" fill="#d4d0c8" stroke="#000"/><rect x="8" y="17" width="8" height="6" fill="#000080"/><circle cx="21" cy="20" r="3" fill="#800000" stroke="#000"/><path d="M16 14 V6 M12 8 h8" stroke="#000" fill="none"/>`,
  ),
  notes: svg(
    `<rect x="8" y="3" width="16" height="26" fill="#fff8c8" stroke="#000"/><path d="M11 9 h10 M11 13 h10 M11 17 h10 M11 21 h7" stroke="#000080"/>`,
  ),
  certs: svg(
    `<rect x="5" y="5" width="22" height="16" fill="#f4f0e4" stroke="#000"/><path d="M8 10 h16 M8 14 h12" stroke="#000080"/><circle cx="16" cy="24" r="4" fill="#c0a000" stroke="#000"/>`,
  ),
  blog: svg(
    `<rect x="5" y="4" width="22" height="24" fill="#fff" stroke="#000"/><rect x="5" y="4" width="22" height="6" fill="#000080"/><path d="M8 14 h16 M8 18 h16 M8 22 h10" stroke="#222"/>`,
  ),
  links: svg(
    `<rect x="4" y="12" width="10" height="8" fill="none" stroke="#000080" stroke-width="2"/><rect x="18" y="12" width="10" height="8" fill="none" stroke="#008080" stroke-width="2"/><path d="M14 16 h4" stroke="#000" stroke-width="2"/>`,
  ),
  contact: svg(
    `<rect x="3" y="8" width="26" height="16" fill="#fff" stroke="#000"/><path d="M3 8 L16 18 L29 8" fill="none" stroke="#000080"/>`,
  ),
  terminal: svg(
    `${frame}<rect x="6" y="7" width="20" height="12" fill="#000"/><path d="M9 11 l4 3 l-4 3 M15 17 h7" stroke="#00a000" fill="none"/>`,
  ),
  help: svg(
    `<circle cx="16" cy="16" r="12" fill="#000080" stroke="#000"/><rect x="13" y="7" width="6" height="2" fill="#fff"/><rect x="11" y="9" width="2" height="3" fill="#fff"/><rect x="17" y="9" width="2" height="5" fill="#fff"/><rect x="13" y="14" width="4" height="2" fill="#fff"/><rect x="14" y="18" width="4" height="2" fill="#fff"/><rect x="14" y="22" width="4" height="3" fill="#fff"/>`,
  ),
  display: svg(
    `${frame}<rect x="6" y="7" width="20" height="12" fill="#008080"/><circle cx="22" cy="16" r="3" fill="#fff"/><rect x="12" y="24" width="8" height="3" fill="#808080"/><rect x="8" y="27" width="16" height="2" fill="#000"/>`,
  ),
  colophon: svg(
    `<rect x="7" y="4" width="18" height="24" fill="#fff" stroke="#000"/><path d="M11 10 h10 M11 14 h10 M11 18 h8" stroke="#000"/>`,
  ),
  login: svg(
    `<rect x="8" y="14" width="16" height="12" fill="#c0c0c0" stroke="#000"/><path d="M12 14 v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="#000"/><rect x="14" y="18" width="4" height="4" fill="#000080"/>`,
  ),
};
