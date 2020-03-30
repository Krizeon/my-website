/* eslint-disable no-native-reassign */
import React from 'react';
import { mount } from 'enzyme';
import Editor from './Editor';
import { findButton } from '../setupTests';

const sampleArticle = {
  title: 'Cheyenne Mountain Complex',
  extract: 'The Cheyenne Mountain Complex is a ...',
  edited: new Date('2016-12-10T14:54:40Z').toISOString()
};

describe('Editor Styled Components and PropTypes', () => {
  describe('PropTypes', () => {
    test('Has PropTypes defined', () => {
      // This is not a React "prop", but a JS property
      expect(Editor).toHaveProperty('propTypes');
    });
  });
});

describe('Editor test', () => {
  let _Date;
  beforeAll(() => {
    _Date = Date;
    const testDate = new Date('2018-1-1');
    Date = class extends Date {
      constructor() {
        return testDate;
      }
      static now() {
        return testDate.valueOf();
      }
    };
  });
  afterAll(() => {
    Date = _Date;
  });

  describe('New article', () => {
    let editor;
    const completeCallback = jest.fn();
    beforeEach(() => {
      completeCallback.mockReset();
      editor = mount(<Editor complete={completeCallback} />);
    });

    test('Editor has input[type=text] with placeholder', () => {
      expect(editor).toContainExactlyOneMatchingElement('input[type="text"]');
      const titleInput = editor.find('input[type="text"]');
      expect(titleInput).toHaveProp('placeholder');
      expect(titleInput.prop('value')).toBeFalsy();
    });

    test('Editor has <textarea> with placeholder', () => {
      expect(editor).toContainExactlyOneMatchingElement('textarea');
      const extractInput = editor.find('textarea');
      expect(extractInput).toHaveProp('placeholder');
      expect(extractInput.prop('value')).toBeFalsy();
    });

    test('Editor has save button', () => {
      const button = findButton(editor, /save/i);
      expect(button.exists()).toBe(true);
    });

    test('Editor has cancel button', () => {
      const button = findButton(editor, /cancel/i);
      expect(button.exists()).toBe(true);
    });

    test('Save button is disabled if title is empty', () => {
      expect(editor.find('input[type="text"]').prop('value')).toBeFalsy();
      const button = findButton(editor, /save/i);
      expect(button.prop('disabled')).toBeTruthy();
    });

    test('Cancel button invokes callback', () => {
      const button = findButton(editor, /cancel/i);
      button.simulate('click');
      expect(completeCallback).toHaveBeenCalledTimes(1);
    });

    describe('New article save tests', () => {
      beforeEach(() => {
        const title = editor.find('input[type="text"]');
        title.simulate('change', {
          target: { value: sampleArticle.title }
        });
      });

      test('Save button is enabled if title is specified', () => {
        const button = findButton(editor, /save/i);
        expect(button.prop('disabled')).toBeFalsy();
      });

      test('Save button invokes callback', () => {
        const button = findButton(editor, /save/i);
        button.simulate('click');
        expect(completeCallback).toHaveBeenCalledWith({
          title: sampleArticle.title,
          extract: '',
          edited: new Date().toISOString()
        });
      });
    });
  });

  describe('Edit article', () => {
    let editor;
    const completeCallback = jest.fn();
    beforeEach(() => {
      completeCallback.mockReset();
      editor = mount(
        <Editor article={sampleArticle} complete={completeCallback} />
      );
    });

    test('Editor has input[type=text] with value', () => {
      expect(editor).toContainExactlyOneMatchingElement('input[type="text"]');
      const titleInput = editor.find('input[type="text"]');
      expect(titleInput).toHaveProp('value', sampleArticle.title);
    });

    test('Editor has <textarea> with placeholder', () => {
      expect(editor).toContainExactlyOneMatchingElement('textarea');
      const extractInput = editor.find('textarea');
      expect(extractInput).toHaveProp('value', sampleArticle.extract);
    });

    test('Save button invokes callback', () => {
      const button = findButton(editor, /save/i);
      button.simulate('click');
      expect(completeCallback).toHaveBeenCalledWith({
        title: sampleArticle.title,
        extract: sampleArticle.extract,
        edited: new Date().toISOString()
      });
    });
  });
});
