import React from 'react';
import { shallow } from 'enzyme';

import Article from './Article';
import { sampleArticles } from '../setupTests';

const [article] = sampleArticles;

const articleEditedDate = new Date(article.edited);

describe('Article tests', () => {
  describe('Article content tests', () => {
    let comp;
    beforeEach(() => {
      comp = shallow(<Article article={article} />);
    });

    test('Has title', () => {
      expect(
        comp.findWhere(n => n.type() && n.text() === article.title)
      ).toHaveLength(1);
    });

    test('Has extract', () => {
      expect(
        comp.findWhere(n => n.type() && n.text() === article.extract)
      ).toHaveLength(1);
    });

    test('Has date', () => {
      expect(
        comp.findWhere(
          n => n.type() && n.text() === articleEditedDate.toLocaleString()
        )
      ).toHaveLength(1);
    });
  });

  describe('PropTypes', () => {
    test('Has PropTypes defined', () => {
      expect(Article).toHaveProperty('propTypes');
    });
  });

  describe('Article CSS has been removed', () => {
    let comp;
    beforeEach(() => {
      comp = shallow(<Article article={article} />);
    });

    test('No longer has div#article', () => {
      expect(comp).not.toContainMatchingElement('div#article');
    });

    test('No longer has #article-title', () => {
      expect(comp).not.toContainMatchingElement('#article-title');
    });

    test('No longer has #article-text', () => {
      expect(comp).not.toContainMatchingElement('#article-text');
    });

    test('Has #article-timestamp', () => {
      expect(comp).not.toContainMatchingElement('#article-timestamp');
    });
  });
});
