'use server';

import { auth, db } from "@/firebase/admin";
import { where } from "firebase/firestore";
import { cookies } from "next/headers";

const ONE_WEEK = 60* 60 * 24 * 7;

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    })
}

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;
    
    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if(userRecord.exists) {
            return {
                success: false,
                message: 'User already exists.  Please sign in instead.'
            }
        };

        await db.collection('users').doc(uid).set({
            name, email
        });

        return {
            success: true,
            message: 'Account created successfully.  Please sign in.'
        };
            
    } catch (e: any) {
        console.error('Error creating a user' , e)

        if(e.code === 'auth/email-already-exist') {
            return {
                success: false,
                message: 'This email is already in use.'
            };
        }
        return {
            success: false,
            message: 'Failed to create an account.'
        };
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord) {
            return {
                success: false,
                message: 'User does not exist.  Create an account instead.'
            }
        }

        await setSessionCookie(idToken);

    } catch (e:any) {
        console.log(e);
        
        return {
            success: false,
            message: 'Failed to log into an account. Please try again.'
        };
    }
}

export async function getCurrentUser(): Promise<User | null> {

    const cookiesStore = await cookies();

    const sessionCookie = cookiesStore.get('session')?.value;

    if(!sessionCookie) {
        console.log("No Session cookie found.")
        return null;
    }

    try {
        console.log("Verifying session cookie...");
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, false);
        console.log("Decoded claims:", decodedClaims);

        const userRecord = await db
            .collection('users')
            .doc(decodedClaims.uid)
            .get();

        if(!userRecord.exists) {
          console.log("User record not found");  
        return null;
        }
        
        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;

    } catch (e) {
            console.log("Error verifying session cookie", e)

            return null
        }
    

}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;
}