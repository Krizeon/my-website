/*
  Editor implements a form for creating a new article or editing an existing
  article.
  props:
    article: The article to be edited [optional]
    complete: A callback to add or save article
  The complete callback should have one optional argument. Calling complete
  with no arguments cancels the operation. Otherwise complete is invoked with
  the article object to be added or updated.
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { ArticleShape } from './Article';

const EditorContainer = styled.div`
  margin: 40px;
`;

const TitleInput = styled.input`
  display: block;
`;

const ExtractInput = styled.textarea`
  margin: 10px 0px;
  display: block;
`;

const Editor = ({ article, complete }) => {
  const [title, setTitle] = useState(article ? article.title : '');
  const [extract, setExtract] = useState(article ? article.extract : '');

  const constructArticle = () => ({
    title: title,
    extract: extract,
    edited: new Date().toISOString()
  });

  return (
    <EditorContainer>
      <TitleInput
        type="text"
        size="45"
        value={title}
        placeholder="Title must be set"
        onChange={event => setTitle(event.target.value)}
      />
      <ExtractInput
        cols="100"
        rows="10"
        value={extract}
        placeholder="Contents"
        onChange={event => setExtract(event.target.value)}
      />
      <div>
        <input
          type="button"
          disabled={title === ''}
          onClick={() => {
            complete(constructArticle());
          }}
          value="Save"
        />
        <input
          type="button"
          onClick={() => {
            complete();
          }}
          value="Cancel"
        />
      </div>
    </EditorContainer>
  );
};

Editor.propTypes = {
  article: ArticleShape,
  complete: PropTypes.func.isRequired
};

Editor.defaultProps = {
  article: null
};

export default Editor;
