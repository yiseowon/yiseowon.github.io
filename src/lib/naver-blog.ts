import sax from 'sax';

const blogId = 'identification0416';
export const blogUrl = `https://blog.naver.com/${blogId}`;
const feedUrl = `https://rss.blog.naver.com/${blogId}.xml`;

interface BlogPost {
  title: string;
  url: string;
  publishedAt: Date;
}

export async function getRecentBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(feedUrl, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`Naver RSS returned HTTP ${response.status}`);

  const feed = sax.parser(true, { strictEntities: true });
  const path: string[] = [];
  const posts = new Map<string, BlogPost>();
  let title = '';
  let link = '';
  let pubDate = '';

  feed.onopentag = ({ name }) => {
    path.push(name);
    if (path.join('/') === 'rss/channel/item') {
      title = '';
      link = '';
      pubDate = '';
    }
  };
  function readText(text: string) {
    switch (path.join('/')) {
      case 'rss/channel/item/title':
        title += text;
        break;
      case 'rss/channel/item/link':
        link += text;
        break;
      case 'rss/channel/item/pubDate':
        pubDate += text;
        break;
    }
  }
  feed.ontext = readText;
  feed.oncdata = readText;
  feed.onclosetag = () => {
    if (path.join('/') === 'rss/channel/item') {
      const url = URL.parse(link.trim());
      const publishedAt = new Date(pubDate.trim());
      const postPath = url?.pathname.split('/');
      if (
        title.trim() &&
        url?.origin === 'https://blog.naver.com' &&
        postPath?.length === 3 &&
        postPath[1] === blogId &&
        /^\d+$/.test(postPath[2]) &&
        Number.isFinite(publishedAt.getTime())
      ) {
        const postUrl = `${url.origin}${url.pathname}`;
        posts.set(postUrl, { title: title.trim(), url: postUrl, publishedAt });
      }
    }
    path.pop();
  };

  feed.write(await response.text()).close();
  return [...posts.values()]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 5);
}
