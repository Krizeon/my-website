import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';

configure({ adapter: new Adapter() });

export const sampleArticles = [
  {
    title: 'Alpha Centauri',
    extract: 'An alien diplomat with an enormous egg shaped head',
    edited: new Date('1972-01-29T18:00:40Z').toISOString(),
    id: 1
  },
  {
    title: 'Dominators',
    extract: 'Galactic bullies with funny robot pals.',
    edited: new Date('1968-08-10T18:00:40Z').toISOString(),
    id: 2
  },
  {
    title: 'Cybermen',
    extract:
      'Once like us, they have now replaced all of their body parts with cybernetics',
    edited: new Date('1966-10-08T18:00:40Z').toISOString(),
    id: 3
  },
  {
    title: 'Autons',
    extract: 'Plastic baddies driven by the Nestine consciousness',
    edited: new Date('1970-01-03T18:00:40Z').toISOString(),
    id: 4
  },
  {
    title: 'Daleks',
    extract: 'Evil little pepperpots of death',
    edited: new Date('1963-12-21T18:00:40Z').toISOString(),
    id: 5
  }
];

export const pseudoServer = {
  localData: sampleArticles.slice(),

  stats: {},

  initialize: function() {
    this.localData = sampleArticles.slice();
    this.stats = {
      get: 0,
      put: 0,
      post: 0,
      delete: 0,
      errors: 0
    };
  },

  find: function(id) {
    return this.localData.find(item => item.id === id);
  },

  replace: function(item) {
    this.localData.splice(this.find(item.id), 1, item);
  },

  put: function(resource, options) {
    this.stats.put += 1;
    const data = JSON.parse(options.body);
    const id = parseInt(resource.slice(resource.lastIndexOf('/') + 1));
    if (data.id !== id) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 500,
        statusText: 'ID mismatch between request and body'
      };
    }

    if (!data.title) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 500,
        statusText: 'Title must be defined'
      };
    }

    if (
      this.localData.find(
        item => item.title === data.title && item.id !== data.id
      )
    ) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 500,
        statusText: 'Article has duplicate title'
      };
    }

    // check if this really is an update
    if (!this.find(data.id)) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 500,
        statusText: 'Original item not found'
      };
    }

    this.replace(data);

    return {
      ok: true,
      json: () => data
    };
  },

  post: function(resource, options) {
    this.stats.post += 1;
    const data = JSON.parse(options.body);

    let maxId = this.localData[0].id;
    this.localData.forEach(item => {
      maxId = Math.max(maxId, item.id);
    });
    maxId = maxId + 2; // In case clients hard code increment
    data.id = maxId;

    if (!data.title) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 400,
        statusText: 'Title must be defined'
      };
    }

    if (this.localData.find(item => item.title === data.title)) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 400,
        statusText: 'Article has duplicate title'
      };
    }

    this.localData.push(data);
    return {
      ok: true,
      json: () => data
    };
  },

  delete: function(resource) {
    this.stats.delete += 1;
    const id = parseInt(resource.slice(resource.lastIndexOf('/') + 1));
    const index = this.localData.findIndex(item => item.id === id);
    // check if this really is a delete
    if (index === -1) {
      this.stats.errors += 1;
      return {
        ok: false,
        status: 500,
        statusText: 'Original item not found'
      };
    }

    this.localData.splice(index, 1);
    return {
      ok: true
    };
  },

  get: function() {
    this.stats.get += 1;
    // Make deep copy of data in case code under test modifies objects
    return {
      ok: true,
      json: () => JSON.parse(JSON.stringify(this.localData))
    };
  }
};

global.fetch = jest.fn(async (resource, options) => {
  if (options && options.method === 'PUT') {
    return pseudoServer.put(resource, options);
  } else if (options && options.method === 'POST') {
    return pseudoServer.post(resource, options);
  } else if (options && options.method === 'DELETE') {
    return pseudoServer.delete(resource);
  } else {
    return pseudoServer.get();
  }
});

/* 
    Used to find the variety of buttons seen in use so far.
*/
export const findButton = (comp, labelRegEx) => {
  // Find <input type="button" ... />
  let button = comp
    .find('input[type="button"]')
    .filterWhere(n => labelRegEx.test(n.prop('value')));
  if (button.length === 0) {
    // If that didn't work, look for "<button> ..."
    button = comp
      .find('button')
      .filterWhere(
        n => labelRegEx.test(n.text()) || labelRegEx.test(n.prop('value'))
      );
  }
  return button;
};

/*
    Use to flush out pending promises.

    use: await flushPromises
  */
export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

export const makeCurrentArticle = (app, article) => {
  // Click on section header and then title of an article
  const section = app
    .find('li')
    .filterWhere(n => n.text() === article.title[0].toUpperCase());
  section.simulate('click');
  const title = app.find('li').filterWhere(n => n.text() === article.title);
  title.simulate('click');
};
