import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import App from './App';
import IndexBar from './components/IndexBar';
import Article from './components/Article';
import Editor from './components/Editor';
import {
  pseudoServer,
  sampleArticles,
  findButton,
  flushPromises,
  makeCurrentArticle
} from './setupTests';

describe('App rendering tests', () => {
  let app;

  beforeEach(async () => {
    pseudoServer.initialize();
    app = mount(<App />);
    await act(async () => await flushPromises());
    app.update();
  });

  describe('App component initial content', () => {
    test('Contains an IndexBar component', () => {
      expect(app).toContainExactlyOneMatchingElement(IndexBar);
    });

    test('Does not display Article at startup', () => {
      expect(app).not.toContainMatchingElement(Article);
    });

    test('Does not display Editor at startup', () => {
      expect(app).not.toContainMatchingElement(Editor);
    });

    test("There should be a 'New Article' button", () => {
      const button = findButton(app, /new[ ]+article/i);
      expect(button.exists()).toBe(true);
    });

    test("There should not be an 'Edit Article' button", () => {
      const button = findButton(app, /edit[ ]+article/i);
      expect(button.exists()).toBe(false);
    });
  });

  describe('IndexBar tests', () => {
    test('IndexBar receives collection and callback as prop', () => {
      expect(app.find(IndexBar)).toHaveProp('collection', sampleArticles);
      expect(app.find(IndexBar)).toHaveProp('select'); // Should be a function
    });
  });
});

describe('App full rendering tests', () => {
  let app;

  beforeEach(async () => {
    pseudoServer.initialize();
    app = mount(<App />);
    await act(async () => await flushPromises());
    app.update();
  });

  // We use full rendering so that we can test Article rendering when a title is clicked
  describe('Article tests', () => {
    let sampleArticle;
    beforeEach(() => {
      [sampleArticle] = sampleArticles; // extract the first article

      makeCurrentArticle(app, sampleArticle);
    });

    test('Article should be visible', () => {
      expect(app).toContainExactlyOneMatchingElement(Article);
    });

    test('Article should have article as its prop', () => {
      expect(app.find(Article)).toHaveProp('article', sampleArticle);
    });

    test("There should be an 'Edit Article' button", () => {
      const button = findButton(app, /edit[ ]+article/i);
      expect(button.exists()).toBe(true);
    });

    describe('Editing article tests', () => {
      beforeEach(() => {
        const button = findButton(app, /edit[ ]+article/i);
        expect(button.exists()).toBe(true);
        button.simulate('click');
      });

      test("Clicking 'Edit Article' opens the editor", () => {
        expect(app).toContainExactlyOneMatchingElement(Editor);
      });

      test("Clicking 'Edit Article' opens the editor with the article", () => {
        expect(app).toContainExactlyOneMatchingElement(Editor);
        const editor = app.find(Editor);
        expect(editor).toHaveProp('article', sampleArticle);
        expect(editor.prop('complete')).toBeInstanceOf(Function);
      });

      test("Clicking 'Cancel' does not update the article", () => {
        expect(app).toContainExactlyOneMatchingElement(Editor);
        const editor = app.find(Editor);
        const cancelButton = findButton(editor, /cancel/i);
        cancelButton.simulate('click');

        const collection = app.find('IndexBar').prop('collection');
        expect(
          collection.find(article => article.title === sampleArticle.title)
        ).toEqual(sampleArticle);

        expect(app).not.toContainExactlyOneMatchingElement(Editor);
        expect(app.find(Article)).toHaveProp('article', sampleArticle);
      });

      test("Clicking 'Save' updates the article", async () => {
        expect(app).toContainExactlyOneMatchingElement(Editor);
        const editor = app.find(Editor);

        editor
          .find('input[type="text"]')
          .simulate('change', { target: { value: '1234' } });
        const saveButton = findButton(editor, /save/i);
        saveButton.simulate('click');

        await act(async () => await flushPromises());
        app.update();

        const collection = app.find('IndexBar').prop('collection');

        expect(
          collection.find(article => article.title === sampleArticle.title)
        ).toBeUndefined();

        const newArticle = collection.find(article => article.title === '1234');

        expect(newArticle.extract).toEqual(sampleArticle.extract);
        expect(newArticle.edited).not.toEqual(sampleArticle.edited);

        expect(app).not.toContainExactlyOneMatchingElement(Editor);
        expect(app.find(Article)).toHaveProp('article', newArticle);
      });
    });
  });

  describe('New Article tests', () => {
    let initialCollection;

    beforeEach(() => {
      initialCollection = app.find('IndexBar').prop('collection');
      const button = findButton(app, /new[ ]+article/i);
      expect(button.exists()).toBe(true);
      button.simulate('click');
    });

    test("Clicking 'New Article' opens the editor", () => {
      expect(app).toContainExactlyOneMatchingElement(Editor);
    });

    test("Clicking 'New Article' opens the editor with correct props", () => {
      expect(app).toContainExactlyOneMatchingElement(Editor);
      const editor = app.find(Editor);
      expect(editor.prop('article')).toBeFalsy();
      expect(editor.prop('complete')).toBeInstanceOf(Function);
    });

    test("Clicking 'Cancel' does not create a new article", async () => {
      expect(app).toContainExactlyOneMatchingElement(Editor);
      const editor = app.find(Editor);

      expect(
        initialCollection.find(article => article.title === '1234')
      ).toBeUndefined();

      editor
        .find('input[type="text"]')
        .simulate('change', { target: { value: '1234' } });
      editor.find('textarea').simulate('change', { target: { value: '5678' } });
      const cancelButton = findButton(editor, /cancel/i);
      cancelButton.simulate('click');

      await act(async () => await flushPromises());
      app.update();

      const collection = app.find('IndexBar').prop('collection');
      expect(
        collection.find(article => article.title === '1234')
      ).toBeUndefined();

      expect(app).not.toContainExactlyOneMatchingElement(Editor);
    });

    test("Clicking 'Save' creates new article", async () => {
      expect(app).toContainExactlyOneMatchingElement(Editor);
      const editor = app.find(Editor);

      expect(
        initialCollection.find(article => article.title === '1234')
      ).toBeUndefined();

      editor
        .find('input[type="text"]')
        .simulate('change', { target: { value: '1234' } });
      editor.find('textarea').simulate('change', { target: { value: '5678' } });
      const saveButton = findButton(editor, /save/i);
      saveButton.simulate('click');

      await act(async () => await flushPromises());
      app.update();

      const collection = app.find('IndexBar').prop('collection');
      const newArticle = collection.find(article => article.title === '1234');
      expect(newArticle.extract).toBe('5678');

      expect(app).not.toContainExactlyOneMatchingElement(Editor);
      expect(app.find(Article)).toHaveProp('article', newArticle);
    });

    test('App state not modified on error response', async () => {
      // edit the article
      const editor = app.find(Editor);
      editor
        .find('input[type="text"]')
        .simulate('change', { target: { value: sampleArticles[2].title } });
      editor.find('textarea').simulate('change', { target: { value: '4321' } });
      const saveButton = findButton(editor, /save/i);
      saveButton.simulate('click');

      await act(async () => await flushPromises());
      app.update();

      expect(pseudoServer.stats.errors).toEqual(1);
      const newCollection = Array.from(app.find('IndexBar').prop('collection'));
      expect(newCollection).toEqual(Array.from(initialCollection));
    });
  });
});

describe('Fetches data from the server', () => {
  let app;
  beforeEach(async () => {
    pseudoServer.initialize();
    app = mount(<App />);
    await act(async () => await flushPromises());
    app.update();
  });

  test('GET message sent to server', () => {
    expect(pseudoServer.stats.get).toEqual(1);
    expect(pseudoServer.stats.errors).toEqual(0);
  });

  test('State is updated', () => {
    const localVersion = Array.from(app.find('IndexBar').prop('collection'));
    expect(localVersion).toHaveLength(pseudoServer.localData.length);

    const serverVersion = pseudoServer.localData.slice();
    localVersion.sort((item1, item2) => item1.id - item2.id);
    serverVersion.sort((item1, item2) => item1.id - item2.id);
    expect(localVersion).toEqual(serverVersion);
  });
});

describe('Updates data on the server', () => {
  let app;
  let sampleArticle;
  beforeEach(async () => {
    // initialize the App
    pseudoServer.initialize();
    app = mount(<App />);
    await act(async () => await flushPromises());
    app.update();

    // Load an article into the editor
    [sampleArticle] = sampleArticles; // extract the first article

    makeCurrentArticle(app, sampleArticle);

    const editButton = findButton(app, /edit[ ]+article/i);
    editButton.simulate('click');

    // edit the article
    const editor = app.find(Editor);

    editor
      .find('input[type="text"]')
      .simulate('change', { target: { value: '1234' } });
    editor.find('textarea').simulate('change', { target: { value: '5678' } });
    const saveButton = findButton(editor, /save/i);
    saveButton.simulate('click');

    await act(async () => await flushPromises());
    app.update();
  });

  test('PUT message sent to server', () => {
    expect(pseudoServer.stats.put).toEqual(1);
    expect(pseudoServer.stats.errors).toEqual(0);
  });

  test('Update made to app state', () => {
    const collection = Array.from(app.find('IndexBar').prop('collection'));

    // the number of articles have not changed
    expect(collection).toHaveLength(sampleArticles.length);

    const updatedArticle = collection.find(
      item => item.id === sampleArticle.id
    );
    expect(updatedArticle.title).toEqual('1234');
    expect(updatedArticle.extract).toEqual('5678');
  });
});

describe('Puts new data on the server', () => {
  let app;

  beforeEach(async () => {
    // initialize the App
    pseudoServer.initialize();
    app = mount(<App />);
    await act(async () => await flushPromises());
    app.update();

    const addButton = findButton(app, /new[ ]+article/i);
    addButton.simulate('click');

    // edit the article
    const editor = app.find(Editor);

    editor
      .find('input[type="text"]')
      .simulate('change', { target: { value: '1234' } });
    editor.find('textarea').simulate('change', { target: { value: '5678' } });
    const saveButton = findButton(editor, /save/i);
    saveButton.simulate('click');

    await act(async () => await flushPromises());
    app.update();
  });

  test('POST message sent to server', () => {
    expect(pseudoServer.stats.post).toEqual(1);
    expect(pseudoServer.stats.errors).toEqual(0);
  });

  test('Update made to app state', () => {
    const collection = Array.from(app.find('IndexBar').prop('collection'));

    // the number of articles have not changed
    expect(collection).toHaveLength(sampleArticles.length + 1);

    const updatedArticle = collection.find(item => item.title === '1234');
    expect(updatedArticle).toBeDefined();
    expect(updatedArticle.extract).toEqual('5678');
  });
});

describe('Delete unit tests', () => {
  let app;

  beforeEach(async () => {
    // Initialize the App to prepare for testing delete
    pseudoServer.initialize();
    app = mount(<App />);
    await act(async () => await flushPromises());
    app.update();
  });

  // YOUR TESTS HERE
});
