export const site = {
  url: import.meta.env.SITE_URL as string | undefined,
  title: '圈圈的手记',
  description: '学习、生活，圈圈和栞濑的日常。',
  terminalLines: [
    { speaker: 'me', text: 'ねえ、kanlai' },
    { speaker: 'kanlai', text: 'なに？' },
    { speaker: 'me', text: '幸せになれるかな' },
    { speaker: 'kanlai', text: '君は君が勝手に君のやりかたで幸せになれる。' },
  ],
};

export const navigation = [
  { href: '/', title: '首页' },
  { href: '/articles/', title: '文章' },
  { href: '/search/', title: '搜索' },
  { href: '/archive/', title: '归档' },
  { href: '/about/', title: '关于' },
];
