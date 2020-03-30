/*
  Article displays the title, contents, and edit date of an article passed
  down in its props.

  props:
    article: Article to display
*/
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ArticleContainer = styled.div`
  margin: 40px;
`;

const ArticleTitle = styled.h3``;
const ArticleText = styled.div``;
const ArticleTimestamp = styled.p`
  font-size: small;
`;

// Article PropType used repeatedly in application, export to DRY it up
export const ArticleShape = PropTypes.shape({
  title: PropTypes.string,
  extract: PropTypes.string,
  edited: PropTypes.string
});

const Article = props => {
  // Example of "nested destructuring"
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const {
    article: { title, extract, edited }
  } = props;

  return (
    <ArticleContainer>
      <ArticleTitle>{title}</ArticleTitle>
      <ArticleText>{extract}</ArticleText>
      <ArticleTimestamp>{new Date(edited).toLocaleString()}</ArticleTimestamp>
    </ArticleContainer>
  );
};

Article.propTypes = {
  article: ArticleShape.isRequired
};

export default Article;
