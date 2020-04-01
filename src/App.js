import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

//import data from './seed.json';
import IndexBar from './components/IndexBar';
import Article from './components/Article';
import Editor from './components/Editor';

const Title = styled.h1`
  text-align: center;
`;

const ButtonBar = styled.div`
  margin: 40px;
`;

// Use this to test finding styled buttons
const Button = styled.button``;

function App() {
  // Create three state variables to store the article collection, the current article
  // and the mode ('view' or 'edit')
  const [currentArticle, setCurrentArticle] = useState(null);
  const [collection, setCollection] = useState([]);
  const [mode, setMode] = useState('view');

  // grab article data from the server (https://simplepedia-server.herokuapp.com/api/articles)
  useEffect(() => {
    fetch('/api/articles/')
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        setCollection(data);
      })
      .catch(err => console.log(err)); // eslint-disable-line no-console
  }, []);

  const handleEditorReturn = newArticle => {
    if (newArticle) {
      if (currentArticle) {
        // merge properties of the currentArticle with the newArticle
        const updatedArticle = { ...currentArticle, ...newArticle };
        const articleId = updatedArticle.id;
        fetch(`/api/articles/${articleId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedArticle),
          headers: new Headers({ 'Content-type': 'application/json' })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .then(data => {
            // create new collection of articles
            const alteredArticles = collection.map(article => {
              if (article.id === data.id) {
                return data;
              }
              return article;
            });
            setCollection(alteredArticles);
            setCurrentArticle(data);
          })
          .catch(err => console.log(err)); // eslint-disable-line no-console
      } else {
        fetch('/api/articles/', {
          method: 'POST',
          body: JSON.stringify(newArticle),
          headers: new Headers({ 'Content-type': 'application/json' })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
          })
          .then(data => {
            const alteredArticles = [];
            alteredArticles.push(data);
            setCollection(alteredArticles);
            setCurrentArticle(data);
          })
          .catch(err => console.log(err)); // eslint-disable-line no-console
      }
    }
    setMode('view');
  };

  //   // Remove edited article if it exists
  //   const newCollection = collection.filter(
  //     article => article !== currentArticle
  //   );
  //   newCollection.push(newArticle);
  //   setCollection(newCollection);
  //   setCurrentArticle(newArticle);
  // }

  //Are we editing?
  if (mode === 'edit') {
    return (
      <div>
        <Title>Simplepedia</Title>
        <Editor article={currentArticle} complete={handleEditorReturn} />
      </div>
    );
  }

  // We are not editing
  // Create our buttons, we will pick which ones to show based on the
  // state of currentArticle
  const newButton = (
    <Button
      type="button"
      name="New Article"
      onClick={() => {
        setCurrentArticle();
        setMode('edit');
      }}
    >
      New Article
    </Button>
  );
  const editButton = (
    <input
      type="button"
      value="Edit Article"
      onClick={() => {
        setMode('edit');
      }}
    />
  );

  // Utilize conditional rendering to only display the Article and edit button components when
  // there is a currentArticle
  return (
    <div>
      <Title>Simplepedia</Title>
      <IndexBar
        collection={collection}
        select={article => setCurrentArticle(article)}
        currentArticle={currentArticle}
      />
      {currentArticle && <Article article={currentArticle} />}
      <ButtonBar>
        {newButton} {currentArticle && editButton}
      </ButtonBar>
    </div>
  );
}

export default App;
