import {useState, useEffect, createContext, useContext, memo} from 'react';
import {useRouter} from 'next/router';
import sdk from '@lettercms/sdk';
import Cookie from 'js-cookie'; 

const UserContext = createContext();

export function getContext() {
  return UserContext;
}

export function useUser() {
  const value = useContext(UserContext)

  if (!value && process.env.NODE_ENV !== "production") {
    throw new Error(
      "[lettercms]: `useUser` must be wrapped in a <DashboardProvider />"
    )
  }

  return value.user || value;
}

export function usePosts(page) {
  const ctx = useContext(UserContext);

  const [posts, setPosts] = useState(null);
  const [actualPage, setPage] = useState(null);

  useEffect(() => {
    if (ctx.user && page !== actualPage) {
      sdk.createRequest(`/user/${ctx.user._id}/recommendation`)
        .then(p => {
          setPage(page);
          setPosts(p)
        });
    }
  }, [page, ctx]);

  if (!ctx.user)
    return {
      status: 'no-user'
    }

  return posts ?? {status:'loading'};
}

export function useRecommendations(url) {
  const ctx = useContext(UserContext);

  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    if (ctx.user) {
      sdk.createRequest(`/user/${ctx.user._id}/recommendation/${url}`)
        .then(p => setRecommendation(p));
    }
  }, [ctx, url]);

  if (!ctx.user)
    return {
      status: 'no-user'
    }

  return recommendation ?? {status:'loading'};
}

export function UserProvider({children, userID}) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userID)
      sdk.createRequest(`/user/${userID}`)
        .then(setUser);
    else
      setUser({_id: 'no-user'});

  }, [userID]);

  let value = {status: 'loading'}

  if (!user._id)
    value = {status: 'error'}
  else
    value = {user}

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}