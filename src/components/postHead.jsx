import React from "react";
import NextHead from "next/head";
import { string, array } from "prop-types";

const Head = ({description, title, images, url, category, published, tags, origin}) => {

  const defaultDescription = "JavaScript, tecnología, informática y mas JavaScript en este blog. Un simple blog de un desarrollador JavaScript Venezolano.";
  const defaultOGURL = origin;
  const defaultOGImage = `${origin}/images/og.jpg`;

  return <NextHead itemscope itemtype="http://schema.org/Article">
      <title>{title + " - David's Devel" || "David's Devel - Blog"}</title>
      <meta
      name="description"
      content={description || defaultDescription}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" sizes="192x192" href="/touch-icon.png" />
      <link rel="apple-touch-icon" href="/touch-icon.png" />
      <link rel="mask-icon" href="/favicon-mask.svg" color="#49B882" />
      <link rel="icon" href="/favicon.ico" />

      <link rel="canonical" href={url ? `${origin}${url}`: defaultOGURL}/>

      <meta property="og:site_name" content="David's Devel - Blog" />
      <meta content='100000619759917' property='fb:admins'/>
      <meta content='337231497026333' property='fb:app_id'/>
      <meta content='es_LA' property='og:locale'/>

      <meta content='article' property='og:type'/>
      <meta name="author" content="David González"/>
      <meta property='article:author' content='https://www.facebook.com/David.ImpulseWD' />
      <meta property='article:publisher' content='https://www.facebook.com/davidsdevel' />
      {
        !!category &&
        <meta content={category[0].toUpperCase() + category.slice(1)} property='article:section'/>
      }
      <meta content={published} property='article:published_time'/>
      {tags.map(e => (<meta key={`tag-${e}`} content={e} property="article:tag"/>))}

      <meta content='@davidsdevel' name='twitter:site'/>
      <meta content='@davidsdevel' name='twitter:creator'/>
      <meta content='summary_large_image' name='twitter:card'/>

      <meta content={title || "David's Devel"} itemProp="name" property='og:title'/>
      <meta content={title || "David's Devel"} name='twitter:title'/>

      <meta content={description || defaultDescription} itemProp='description'/>
      <meta content={description || defaultDescription} property='og:description'/>
      <meta content={description || defaultDescription} name='twitter:description'/>
      {
        images
        ? images.map(e => <div key={e}>
          <meta content={e} property='og:image'/>
          <meta content={e} name='twitter:image'/>
          <link href={e} rel='image_src'/>
          <meta content={e} itemProp='image'/>
        </div>)
        : <div>
          <meta content={defaultOGImage} property='og:image'/>
          <link href={defaultOGImage} rel='image_src'/>
          <meta content={defaultOGImage} itemProp='image'/>
          <meta content={defaultOGImage} name='twitter:image'/>
        </div>
      }
      <meta content={url ? `${origin}${url}` : defaultOGURL} itemProp='url'/>
      <meta content={url ? `${origin}${url}` : defaultOGURL} property='og:url'/>
      <meta content={url ? `${origin}${url}` : defaultOGURL} name='twitter:url'/>

      <link rel="manifest" href="/manifest.json"/>
  </NextHead>;
}

Head.propTypes = {
  title: string,
  description: string,
  url: string,
  images: array,
  tags: array,
  published: string,
  category: string,
  origin: string,
};

export default Head;
