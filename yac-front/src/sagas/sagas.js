import { put, takeEvery, all } from 'redux-saga/effects';
import Axios from 'axios';
import * as actions from '../constants/actions';
import { URL, USER, MESSAGE } from '../constants/config';
import firebase from '../store/firebase';

// worker Saga: will be fired on FETCH_USER actions
function* fetchUser(action) {
  console.log('fetchUser');
  try {
    const params = {
      ...action.data,
    };
    const sol = yield Axios.post(`${URL}${USER}`, params);
    if (sol.data) {
      yield put({ type: actions.USER_FETCH_SUCCEEDED, data: sol.data });
      yield put({ type: actions.CURRENT_USER, data: sol.data });
    } else if (firebase.auth().currentUser) {
      console.log(firebase.auth());
      const {
        uid: userUid, email, displayName, photoURL: image,
      } = firebase.auth().currentUser;
      const [firstName, lastName] = displayName.split(' ');
      const [username] = email.split('@');
      yield put({
        type: actions.CREATE_USER_DB,
        data: {
          userUid, email, firstName, lastName, image, username,
        },
      });
    }
  } catch (e) {
    console.log(e);
    yield put({ type: actions.USER_FETCH_FAILED, message: e.message });
  }
}

function* createUserDB({
  data: {
    userUid, email, firstName, lastName, image, username,
  },
}) {
  console.log('createUserDB');
  try {
    const body = {
      userUid, firstName, lastName, email, image, username,
    };
    const response = yield Axios.post(`${URL}${USER}`, body);
    yield put({
      type: actions.CREATE_USER_SUCCESS,
      payload: response,
    });
  } catch (e) {
    console.log(e);
    yield put({ type: actions.CREATE_USER_FAILED, message: e.message });
  }
}

export function* createUserWithEmailAndPassword({
  data: {
    email, password, firstName, lastName, image, username,
  },
}) {
  console.log('createUserWithEmailAndPassword');
  try {
    if (email && password) {
      const response = yield firebase.auth().createUserWithEmailAndPassword(email, password);
      const userUid = response.user.uid;
      yield put({
        type: actions.CREATE_USER_DB,
        data: {
          email, password, firstName, lastName, image, userUid, username,
        },
      });
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: actions.CREATE_USER_FAILED,
      payload: e,
    });
  }
}

export function* signInWithEmailAndPassword({ data: { email, password } }) {
  console.log('signInWithEmailAndPassword');
  try {
    if (email && password) {
      const response = yield firebase.auth().signInWithEmailAndPassword(email, password);
      yield put({
        type: actions.SIGN_IN_SUCCESS,
        payload: response,
      });
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: actions.SIGN_IN_FAILED,
      payload: e,
    });
  }
}

export function* signOut() {
  console.log('signOut');
  try {
    const response = yield firebase.auth().signOut();
    yield put({
      type: actions.SIGN_OUT_SUCCESS,
      payload: response,
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: actions.SIGN_OUT_FAILED,
      payload: e,
    });
  }
}

export function* signInWithSocial({ data: { provider } }) {
  console.log('signInWithSocial');
  try {
    if (provider) {
      let authProvider;
      switch (provider) {
        case 'GOOGLE':
          authProvider = new firebase.auth.GoogleAuthProvider();
          break;
        case 'FACEBOOK':
          authProvider = new firebase.auth.FacebookAuthProvider();
          break;
        case 'GITHUB':
          authProvider = new firebase.auth.GithubAuthProvider();
          break;
        default:
          break;
      }
      const response = yield firebase.auth()
        .signInWithPopup(authProvider);
      yield put({
        type: actions.SIGN_IN_SUCCESS,
        payload: response,
      });
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: actions.SIGN_IN_FAILED,
      payload: e,
    });
  }
}

export function* updateChatState({ data: { meesageId, snapshot, userUid } }) {
  console.log('updateChatState');
  try {
    if (snapshot) {
      yield put({
        type: actions.UPDATE_CHAT_SUCCESS,
        data: { userUid, meesageId },
        payload: snapshot,
      });
    }
  } catch (e) {
    console.log(e);
  }
}

export function* postMessage({
  data: {
    currentMessage, openChannel, userUid, username,
  },
}) {
  console.log('postMessage');
  try {
    const body = {
      username,
      userUid,
      message: currentMessage,
      channel: openChannel,
    };
    const result = yield Axios.post(`${URL}${MESSAGE}`, body);
    console.log(result);
    yield put({ type: actions.POST_MESSAGE_SUCCEEDED, result });
  } catch (e) {
    yield put({ type: actions.POST_MESSAGE_FAILED, message: e.message });
  }
}
/*
  Starts fetchUser on each dispatched `FETCH_USER` action.
  Allows concurrent fetches of user.
*/
function* watchCreateUserWithEmailAndPassword() {
  yield takeEvery(actions.CREATE_USER_WITH_EMAIL_AND_PASSWORD, createUserWithEmailAndPassword);
}
function* watchSignInWithEmailAndPassword() {
  yield takeEvery(actions.SIGN_IN_WITH_EMAIL_AND_PASSWORD, signInWithEmailAndPassword);
}
function* watchSignInWithSocial() {
  yield takeEvery(actions.SIGN_IN_WITH_SOCIAL, signInWithSocial);
}
function* watchSignOut() {
  yield takeEvery(actions.SIGN_OUT, signOut);
}
function* watchFetchUser() {
  yield takeEvery(actions.FETCH_USER, fetchUser);
}
function* watchUpdateChatState() {
  yield takeEvery(actions.UPDATE_CHAT, updateChatState);
}
function* watchPostMessage() {
  yield takeEvery(actions.POST_MESSAGE, postMessage);
}
function* watchCreateUserDB() {
  yield takeEvery(actions.CREATE_USER_DB, createUserDB);
}

export default function* rootSaga() {
  yield all([
    watchCreateUserWithEmailAndPassword(),
    watchSignInWithEmailAndPassword(),
    watchSignInWithSocial(),
    watchSignOut(),
    watchFetchUser(),
    watchUpdateChatState(),
    watchPostMessage(),
    watchCreateUserDB(),
  ]);
}
