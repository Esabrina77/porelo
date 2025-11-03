export const useApi = () => {
  // Déplacer useRuntimeConfig DANS le corps de la fonction
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl

  const api = $fetch.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return api
}
