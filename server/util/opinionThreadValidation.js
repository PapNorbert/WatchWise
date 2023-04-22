import { checkUserExistsWithUsername } from '../db/users_db.js'


export async function validateOpinionTreadCreation(watchGroupJson) {
  let error = null
  let correct = true

  if (watchGroupJson.title === '' || watchGroupJson.title === null) {
    error = 'empty_title';
    correct = false;
  }
  if (watchGroupJson.description === '' || watchGroupJson.description === null) {
    error = 'empty_description';
    correct = false;
  }
  if (watchGroupJson.creator === '' || watchGroupJson.creator === null) {
    error = 'creator_missing';
    correct = false;
  }
  if (watchGroupJson.show === '' && watchGroupJson.show === null) {
    error = 'empty_show';
    correct = false;
  }

  if (!error) {
    const exists = await checkUserExistsWithUsername(watchGroupJson.creator);
    if (!exists) {
      error = 'user_not_exists';
      correct = false;
    }
  }

  return { correct, error }
}