const { serializeUserSecurely } = require('./user-serializer');

function depopulate(page, attributeName) {
  // revert the ObjectID
  if (page[attributeName] != null && page[attributeName]._id != null) {
    page[attributeName] = page[attributeName]._id;
  }
}

function depopulateRevisions(page) {
  depopulate(page, 'revision');
  depopulate(page, 'revisionHackmdSynced');
}

function serializeInsecureUserAttributes(page) {
  if (page.lastUpdateUser != null && page.lastUpdateUser._id != null) {
    page.lastUpdateUser = serializeUserSecurely(page.lastUpdateUser);
  }
  if (page.creator != null && page.creator._id != null) {
    page.creator = serializeUserSecurely(page.creator);
  }
  if (page.revision != null && page.revision.author != null && page.revision.author._id != null) {
    page.revision.author = serializeUserSecurely(page.revision.author);
  }
  if (page.revisionHackmdSynced != null && page.revisionHackmdSynced.author != null && page.revisionHackmdSynced.author._id != null) {
    page.revisionHackmdSynced.author = serializeUserSecurely(page.revisionHackmdSynced.author);
  }
  return page;
}

function serializePageSecurely(page, shouldDepopulateRevisions = false) {
  let serialized = page;

  // invoke toObject if page is a model instance
  if (page.toObject != null) {
    serialized = page.toObject();
  }

  // optional depopulation
  if (shouldDepopulateRevisions) {
    depopulateRevisions(serialized);
  }

  serializeInsecureUserAttributes(serialized);

  return serialized;
}

module.exports = {
  serializePageSecurely,
};
