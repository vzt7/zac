import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SeoHead = ({
  title,
  description,
  keywords,
  image = '/og-image.png',
  url,
}: SeoHeadProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const defaultTitle = {
    en: 'Canvave - Free Online Poster Design Tool',
    zh: 'Canvave - 免费在线海报设计工具',
  }[currentLang];

  const defaultDescription = {
    en: 'Create beautiful posters, social media images and marketing materials easily with our free online design tool.',
    zh: '使用我们的免费在线设计工具轻松创建精美海报、社交媒体图片和营销素材。',
  }[currentLang];

  const defaultKeywords = {
    en: 'poster design,online design tool,image editor,social media images,marketing materials,free design tool',
    zh: '海报设计,在线设计工具,图片编辑器,社交媒体图片,营销素材,免费设计工具',
  }[currentLang];

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta
        property="og:description"
        content={description || defaultDescription}
      />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url || window.location.href} />
      <link
        rel="alternate"
        hrefLang={currentLang}
        href={window.location.href}
      />
      <link rel="canonical" href={url || window.location.href} />
    </Helmet>
  );
};
