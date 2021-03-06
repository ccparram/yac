import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Avatar, Button, CssBaseline, TextField,
  FormControlLabel, Checkbox, Link, Grid,
  Box, Typography, Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LockOutlined } from '@material-ui/icons';
import { USER_UPDATE, CREATE_USER_WITH_EMAIL_AND_PASSWORD } from '../../../constants/actions';
import { LOGIN, CHATROOM } from '../../../constants/routes';
import firebase from '../../../store/firebase';
import { Copyright } from '../../commons';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const SignUp = ({
  changeUserUpdate, firstName, lastName,
  email, password, terms, createUser,
  image, history, user, username,
}) => {
  const classes = useStyles();
  useEffect(() => {
    if (user.userUid && firebase.auth().currentUser) {
      history.push(CHATROOM);
    }
  }, [history, user]);
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <div className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={firstName}
                onChange={(e) => changeUserUpdate('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
                value={lastName}
                onChange={(e) => changeUserUpdate('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => changeUserUpdate('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => changeUserUpdate('username', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => changeUserUpdate('password', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I have read terms and conditions"
                value={terms}
                onChange={(e) => changeUserUpdate('terms', e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() => createUser(email, password, firstName, lastName, image)}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href={LOGIN} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </div>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
};

const mapStateToProps = (state) => ({
  user: state.userState,
  firstName: state.userState.user.firstName,
  lastName: state.userState.user.lastName,
  email: state.userState.user.email,
  password: state.userState.user.password,
  lastLogin: state.userState.user.lastLogin,
  username: state.userState.user.username,
  image: state.userState.user.image, // TODO: Load image from  stock
});

const mapDispatchToProps = (dispatch) => ({
  changeUserUpdate: (type, value) => dispatch({ type: USER_UPDATE, payload: { type, value } }),
  createUser: (email, password, firstName, lastName, image) => dispatch(
    {
      type: CREATE_USER_WITH_EMAIL_AND_PASSWORD,
      data: {
        email, password, firstName, lastName, image,
      },
    },
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
