import {createClient, PhotosWithTotalResults} from "pexels";
import {ref} from "vue";
import {ErrorResponse} from "pexels/dist/types";
import {IPhoto} from "../types";

const pexelKey = import.meta.env.VITE_PEXEL_KEY
const client = ref()
const usePhoto = (): { getPhotos: () => Promise<IPhoto[]> } | undefined => {
    if (!pexelKey) {
        console.error('No Pexel key provided. Please add your pexel key to your .env file')
        return
    }

    if (!client.value) {
        try {
            client.value = createClient(pexelKey);
        } catch (e) {
            console.error('Unable to create Pexel client.')
        }
    }

    const getPhotos = (): Promise<IPhoto[]> => {
        return new Promise((resolve, reject) => {
            client.value.photos.search({query: 'people', orientation: 'portrait', size: 'small', page: 1, per_page: 40})
                .then((res: PhotosWithTotalResults | ErrorResponse) => {
                    if ('photos' in res) {
                        const photos : IPhoto[] = res.photos.map((photo) => {
                            return {
                                id: String(photo.id),
                                src: photo.src.portrait,
                                credits: {name: photo.photographer, link: photo.photographer_url}
                            }
                        })
                        resolve(photos)
                    } else if ('error' in res) {
                        reject(res.error)
                    }

                    reject('Something went wrong. Please try again later.')
                })
        })
    }

    return {
        getPhotos
    }

}

export default usePhoto;
