import pool from './connection_db.js'

const announcementsCollection = pool.collection("announcements");



export async function findAnnouncements(page, limit) {
  try {
    let aqlParameters = {
      offset: (page - 1) * limit,
      count: limit
    }
    const aqlQuery = `FOR doc IN announcements
    SORT doc.creation_date DESC
    LIMIT @offset, @count
    RETURN doc`;
    const cursor = await pool.query(aqlQuery, aqlParameters);
    return await cursor.all();
  } catch (err) {
    throw err.message;
  }
}

export async function getAnnouncementsCount() {
  try {
    let aqlQuery = `RETURN LENGTH(FOR doc IN announcements
      RETURN true)`;
    const cursor = await pool.query(aqlQuery);
    return (await cursor.all())[0];
  } catch (err) {
    throw err.message;
  }
}

export async function insertAnnouncement(announcementJson) {
  try {
    const cursor = await announcementsCollection.save(announcementJson);
    return cursor._key;
  } catch (err) {
    throw err.message;
  }
}

export async function deleteAnnouncement(key) {
  try {
    await announcementsCollection.remove({ _key: key });
    return true;
  } catch (err) {
    if (err.message == "document not found") {
      console.log(`Warning for moderator request document with _key ${key} during delete request: `, err.message);
      return false;
    } else {
      throw err.message;
    }

  }
}