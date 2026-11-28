import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Leistungen', href: getPermalink('/#leistungen') },
    { text: 'Projekte', href: getPermalink('/projekte') },
    { text: 'Über mich', href: getPermalink('/#ueber-mich') },
    { text: 'Kontakt', href: getPermalink('/#kontakt') },
  ],
  actions: [{ text: 'Anfrage senden', href: getPermalink('/#kontakt'), variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Die Fräserei',
      links: [
        { text: 'Leistungen', href: getPermalink('/#leistungen') },
        { text: 'Projekte', href: getPermalink('/projekte') },
        { text: 'Über mich', href: getPermalink('/#ueber-mich') },
        { text: 'Kontakt', href: getPermalink('/#kontakt') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Impressum', href: getPermalink('/impressum') },
    { text: 'Datenschutz', href: getPermalink('/datenschutz') },
  ],
};
