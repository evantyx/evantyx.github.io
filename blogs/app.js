const root = document.getElementById('blog-root');

const getSlug = () => {
  const url = new URL(globalThis.location.href);
  return url.searchParams.get('slug');
};

const setPageMeta = (post) => {
  document.title = `${post.title} | Evantyx`;
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const clearRoot = () => {
  root.replaceChildren();
};

const createElement = (tagName, className, textContent) => {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  return element;
};

const getSectionBlocks = (section) => {
  if (Array.isArray(section.blocks) && section.blocks.length > 0) {
    return section.blocks;
  }

  const blocks = [];

  if (Array.isArray(section.paragraphs)) {
    section.paragraphs.forEach((paragraph) => {
      blocks.push({ type: 'paragraph', text: paragraph });
    });
  }

  if (Array.isArray(section.cards)) {
    blocks.push({ type: 'cards', items: section.cards });
  }

  if (Array.isArray(section.items)) {
    blocks.push({ type: 'list', items: section.items });
  }

  if (section.image?.src) {
    blocks.push({ type: 'image', ...section.image });
  }

  return blocks;
};

const createStatusHero = (eyebrow, title, summary) => {
  const hero = createElement('section', 'hero');
  hero.append(
    createElement('div', 'eyebrow', eyebrow),
    createElement('h1', '', title),
    createElement('p', 'summary', summary)
  );
  return hero;
};

const renderNotFound = () => {
  clearRoot();
  root.append(
    createStatusHero(
      'Blog',
      'Blog post not found',
      'This page could not find the requested article. Choose a valid blog entry from the homepage insights section.'
    )
  );
};

const createImageBlock = (block) => {
  if (!block.src) {
    return null;
  }

  const figure = createElement('figure', 'media-block');
  const image = createElement('img');
  image.src = block.src;
  image.alt = block.alt || '';
  image.loading = 'lazy';
  figure.append(image);

  if (block.caption) {
    figure.append(createElement('figcaption', '', block.caption));
  }

  return figure;
};

const createSectionBlock = (block) => {
  if (block.type === 'paragraph') {
    return createElement('p', '', block.text);
  }

  if (block.type === 'list' && Array.isArray(block.items)) {
    const list = createElement('ul');
    block.items.forEach((item) => {
      list.append(createElement('li', '', item));
    });
    return list;
  }

  if (block.type === 'cards' && Array.isArray(block.items)) {
    const grid = createElement('div', 'grid');
    block.items.forEach((card) => {
      const cardElement = createElement('div', 'card');
      cardElement.append(
        createElement('strong', '', card.title),
        createElement('p', '', card.body)
      );
      grid.append(cardElement);
    });
    return grid;
  }

  if (block.type === 'image') {
    return createImageBlock(block);
  }

  return null;
};

const createSection = (section) => {
  const sectionElement = createElement('section', 'section');
  sectionElement.append(createElement('h2', '', section.title));

  getSectionBlocks(section).forEach((block) => {
    const blockElement = createSectionBlock(block);
    if (blockElement) {
      sectionElement.append(blockElement);
    }
  });

  return sectionElement;
};

const createHero = (post) => {
  const hero = createElement('section', 'hero');
  hero.append(
    createElement('div', 'eyebrow', post.category),
    createElement('h1', '', post.title)
  );

  if (post.author || post.date) {
    const byline = createElement('div', 'byline');
    if (post.author) {
      byline.append(createElement('span', '', post.author));
    }
    if (post.date) {
      byline.append(createElement('span', '', formatDate(post.date)));
    }
    hero.append(byline);
  }

  hero.append(createElement('p', 'summary', post.summary));

  const visual = createElement('div', 'visual');
  visual.append(createElement('span', '', post.visual));
  hero.append(visual);

  return hero;
};

const renderPost = (post) => {
  clearRoot();
  root.append(createHero(post));
  post.sections.forEach((section) => {
    root.append(createSection(section));
  });
};

const renderLoadError = () => {
  clearRoot();
  root.append(createStatusHero('Blog', 'Unable to load blog content', 'Please try again in a moment.'));
};

const init = async () => {
  const slug = getSlug();

  if (!slug) {
    renderNotFound();
    return;
  }

  try {
    const response = await fetch('/data/blogs.json');
    const posts = await response.json();
    const post = posts.find((entry) => entry.slug === slug);

    if (!post) {
      renderNotFound();
      return;
    }

    setPageMeta(post);
    renderPost(post);
  } catch {
    renderLoadError();
  }
};

init();
