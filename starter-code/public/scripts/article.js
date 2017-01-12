'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: Refactor the parameter to expect the data from the database, rather than a local file.
Article.loadAll = function(rows) {
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// Refactor this to check if the database holds any records or not. If the DB is empty,
// we need to retrieve the JSON and process it.
// If the DB has data already, we'll load up the data (sorted!), and then hand off control to the View.
Article.fetchAll = function(callback) {
  $.get('/articles/all')
  .then (
    function(results) {
      if (results.rows.length) {
        Article.loadAll(results.rows);
      } else {
        $.getJSON ('data/hackerIpsum.json')
        .then(
          function (results) {
            results.forEach(function (obj) {
              let record = new Article(obj);
              record.insertRecord();
            })
          }
        )
      }
    }
  )
  .then(
    function (callback) {
      Article.fetchAll(callback);
    }
  )
  .catch(function (err) {
    console.error(err);
  })
};
        // THEN() iterate over the results, and create a new Article object for each.
          // When that's complete call the insertRecord method for each article you've created.
        // THEN() invoke fetchAll and pass your callback as an argument
        // Don't forget to CATCH() any errors


// REVIEW: Lets take a few minutes and review what each of these new methods do in relation to our server and DB
Article.truncateTable = function(callback) {
  $.ajax({
    url: '/articles/truncate',
    method: 'DELETE',
  })
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

Article.prototype.insertRecord = function(callback) {
  $.post('/articles/insert', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: '/articles/delete',
    method: 'DELETE',
    data: {id: this.id}
  })
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: '/articles/delete',
    method: 'DELETE',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title,
      id: this.id
    }
  })
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
