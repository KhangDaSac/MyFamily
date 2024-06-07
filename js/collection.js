console.log('có chạy')
const url = '../data.json';
let dataCollection = null;

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    let results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        let collectionName = getParameterByName('name');
        let length = data.length;
        let title;
        for(let i = 0; i < length; i++){
            title = data[i].name.split(';');
            if(title[0] == collectionName){
                dataCollection = data[i];
                break;
            }
        }

        $('#collection-title').append(`
            <h2>${title[1]}</h2>
            <p>${title[2]}</p>
        `);

        let img_list = $('#img-list');
        dataCollection.listImage.forEach(image => {
            img_list.append(`
                <div class="col-10 col-sm-5 col-md-3 col-lg-2 m-3 p-0 img-item d-flex justify-content-center align-items-center">
                    <div>
                        <img src="${image.thumbnailLink}" class="img-fluid rounded" alt="..." data-bs-target="#modalToggle" data-bs-toggle="modal">
                    </div>
                </div>

            `)
        });
    })
    .catch(error => console.error('There was a problem with the fetch operation:', error));
    

