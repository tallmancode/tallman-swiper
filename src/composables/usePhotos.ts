import {createClient, PhotosWithTotalResults} from "pexels";
import {ref} from "vue";
import {ErrorResponse} from "pexels/dist/types";
const pexelKey = import.meta.env.VITE_PEXEL_KEY
const client = ref()
const usePhoto = () : {getPhotos: () => Promise<string[]>} | undefined => {
    if(!pexelKey){
        console.error('No Pexel key provided. Please add your pexel key to your .env file')
        return
    }

    if(!client.value){
        try{
            client.value = createClient(pexelKey);
        }catch(e){
            console.error('Unable to create Pexel client.')
        }
    }

    const getPhotos = () : Promise<string[]> => {
        return new Promise((resolve, reject) => {
            client.value.photos.search({query: 'people', orientation: 'portrait', size: 'small', page: 1, per_page: 40})
                .then((res: PhotosWithTotalResults | ErrorResponse) => {
                if('photos' in res){
                    const photos = res.photos.map((photo) => {
                        return photo.src.portrait
                    })
                    resolve(photos)
                }else if ('error' in res){
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
