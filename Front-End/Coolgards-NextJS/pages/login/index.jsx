import * as React from 'react';
import {useContext} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from "next/link";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {ax} from "../../utils/axios";
import {AlertContext, UserContext} from "../_app";
import {useRouter} from "next/router";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";


export default function Login() {
    const router = useRouter()
    const {setError, setMessage} = useContext(AlertContext)

    const {setUser} = useContext(UserContext)
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const model = {
            email: data.get('email'),
            password: data.get('password'),
        };
        ax.post("/api/users/login", model).then((res) => {
            setUser(res.data.data);
            setMessage('welcome back ;)')
            localStorage.setItem('authenticated', true)
            if (router.query.hasOwnProperty('redirect'))
            {
                router.push(router.query.redirect)
            } else {
                router.push('/')
            }
        }).catch(e => {
            setError(e.response?.data?.message || e.message)
        })

    };

    return (
        <div className="flex justify-center mb-20 mt-20">
            <div className="mt-4 flex w-96 flex flex-col items-center glass p-4">
                <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                    <VpnKeyOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <form onSubmit={handleSubmit} className="mt-1">
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="/forgot" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/signup" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </div>
    );
}