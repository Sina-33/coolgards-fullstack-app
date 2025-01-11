import * as React from 'react';
import {useContext} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from "next/link";
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import {ax} from "../../utils/axios";
import {AlertContext, UserContext} from "../_app";
import {useRouter} from "next/router";


export default function Signup() {
    const router = useRouter()
    const {setError, setMessage} = useContext(AlertContext)

    const {setUser} = useContext(UserContext)
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const model = {
            fullName: data.get('fullName'),
            email: data.get('email'),
            password: data.get('password'),
        };
        ax.post("/api/users/", model).then((res) => {
            setUser(res.data.data);
            setMessage('welcome to coolgards ;)')
            localStorage.setItem('authenticated', true)
            router.push('/')
        }).catch(e => {
            setError(e.response?.data?.message || e.message)
        })

    };

    return (
        <div className="flex justify-center mb-20 mt-20">
            <div className="mt-4 flex w-96 flex flex-col items-center glass p-4">
                <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
                <form onSubmit={handleSubmit} className="mt-1">
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="fullName"
                        autoComplete="name"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
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
                        Register
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="/forgot" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/login" variant="body2">
                                {"Already have an account? Log in"}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </div>
    );
}