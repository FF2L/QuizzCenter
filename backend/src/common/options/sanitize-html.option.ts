// sanitize-html.option.ts
import sanitizeHtml from 'sanitize-html'; // nếu KHÔNG bật esModuleInterop, dùng: import * as sanitizeHtml from 'sanitize-html';

export const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    'b','strong','i','em','u','s','span','p','br','ul','ol','li',
    'blockquote','h1','h2','h3','code','a','img'
  ],
  allowedAttributes: {
    a: ['href','target','rel'],
    // img: ['src','alt','width','height'],
    span: ['style'],
    p: ['style'],
    '*': ['class']
  },
  allowedStyles: {
    '*': { 'text-align': [/^left|right|center|justify$/] }
  },
  transformTags: {
    // thêm rel/target an toàn cho <a>
    'a': (tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        ...attribs,
        rel: attribs.rel ?? 'noopener noreferrer',
        target: attribs.target ?? '_blank',
      }
    }),
  },
};
