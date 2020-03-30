/*
  IndexBar displays the list of sections (first letter) for the collection of
  articles passed down in its props. Clicking on one of these sections displays
  a list of the available titles in that current section.

  props:
    collection: An array of articles
    select: A callback when article is selected
*/
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { ArticleShape } from './Article';

const HorizontalUL = styled.ul`
  list-style: none;
`;

const SectionItem = styled.li`
  display: inline;
  padding: 5px;
  font-weight: bold;
`;

const TitleItem = styled.li``;

/*
  Sections headers sub-component in the IndexBar.
  props:
    sections - the list of the available sections
    setSection - a callback for when a section has been selected
*/
export function IndexSections(props) {
  const { sections, setSection } = props;

  // Build the list of sections
  const sectionItems = sections.map(section => (
    <SectionItem
      key={section}
      onClick={() => {
        setSection(section);
      }}
    >
      {section}
    </SectionItem>
  ));

  return (
    <div>
      <HorizontalUL>{sectionItems}</HorizontalUL>
    </div>
  );
}

IndexSections.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSection: PropTypes.func.isRequired
};

/*
  Title list sub-component in the IndexBar.
  props:
    articles - the list of articles to be displayed
    select - the callback to indicate which title has been selected

  Note that this doesn't know about all articles: just those passed to it.
*/
export function IndexTitles({ articles, select }) {
  // Sort the articles by title
  const sortedArticles = articles
    .slice()
    .sort((a1, a2) => a1.title.localeCompare(a2.title));

  // Assemble the list of titles
  const titles = sortedArticles.map(article => (
    <TitleItem
      key={article.id}
      onClick={() => {
        select(article);
      }}
    >
      {article.title}
    </TitleItem>
  ));

  return (
    <div>
      <ul>{titles}</ul>
    </div>
  );
}

IndexTitles.propTypes = {
  articles: PropTypes.arrayOf(ArticleShape).isRequired,
  select: PropTypes.func.isRequired
};

const toSection = function titleToSection(article) {
  return article.title[0].toUpperCase();
};

const toSections = function articlesToSections(articles) {
  // Use set to "deduplicate" sections
  const sections = new Set();
  articles.forEach(article => {
    if (article.title) {
      sections.add(toSection(article));
    }
  });
  // Return array of sorted section headers
  return Array.from(sections).sort();
};

function IndexBar({ collection, select, currentArticle }) {
  const [section, setSection] = useState('');

  useEffect(() => {
    if (currentArticle) {
      setSection(toSection(currentArticle));
    }
  }, [currentArticle]);

  // Conditionally create the title list if we have a selected section
  let titles;
  if (section) {
    const articles = collection.filter(
      article => toSection(article) === section
    );
    titles = <IndexTitles articles={articles} select={select} />;
  } else {
    titles = <p style={{ textAlign: 'center' }}>Select a section</p>;
  }

  return (
    <div>
      <IndexSections
        sections={toSections(collection)}
        setSection={newSection => {
          if (newSection !== section) {
            setSection(newSection);
            select(); // Deselect any current article
          }
        }}
      />
      {titles}
    </div>
  );
}

IndexBar.propTypes = {
  collection: PropTypes.arrayOf(ArticleShape).isRequired,
  select: PropTypes.func.isRequired,
  currentArticle: ArticleShape
};

IndexBar.defaultProps = {
  currentArticle: null
};

export default IndexBar;
