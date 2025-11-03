import { useApi } from './useApi'

export const useUser = () => {
    const api = useApi()

    //créer un utilisateur
    const createUser = async (userData: {  email: string; password: string }) => {
        try{
            const response = await api('/users',{
method : 'POST',
body : userData
 })
 return {data : response, error: null}
        }catch (error) {
            return {data: null, error: error}
        }
    }

//récuperer tous les utilisateurs

const getUsers = async () => {
 try {
    const response = await api('/users',{
        method : 'GET'
    })
    return {data : response, error: null}
 }catch (error) {
    console.error('Erreur lors de la récupération:', error)
    return {data: null, error: error}
 }
}

    return { createUser, getUsers }
}