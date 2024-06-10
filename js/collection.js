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
        let i = 0;
        dataCollection.listImage.forEach(image => {
            img_list.append(`
                <div class="col-10 col-sm-5 col-md-3 col-lg-2 m-3 p-0 img-item d-flex justify-content-center align-items-center">
                    <div>
                        <img src="${image.thumbnailLink}" class="img-fluid rounded" alt="..." index="${i}" data-bs-target="#modalToggle" data-bs-toggle="modal">
                    </div>
                </div>
            `)
            i++;
        });

    })
    .catch(error => console.error('There was a problem with the fetch operation:', error));

    $(document).ready(function () {
        let isDragging = false;
        let startX, startY;
        let deltaX, deltaY;

        function handleStart(e) {
            isDragging = true;
            const touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            console.log('Start dragging');
        }

        function handleMove(e) {
            if (isDragging) {
                const touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                deltaX = touch.clientX - startX;
                deltaY = touch.clientY - startY;
                console.log('Dragging');
            }
        }

        function handleEnd() {
            if (isDragging) {
                isDragging = false;
                console.log('Stop dragging');
                console.log('deltaX: ', deltaX);
                console.log('deltaY: ', deltaY);

                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
                    if (deltaX < 0) {
                        console.log('Swipe left');
                        let index = parseInt($('#modal-img').attr('index'));
                        index = (index + 1) % dataCollection.listImage.length;
                        $('#modal-img').attr('index', index);
                        $('#modal-img').attr('src', dataCollection.listImage[index].thumbnailLink);
                    } else if (deltaX > 0) {
                        console.log('Swipe right');
                        let index = parseInt($('#modal-img').attr('index'));
                        index = (index - 1 + dataCollection.listImage.length) % dataCollection.listImage.length;
                        $('#modal-img').attr('index', index);
                        $('#modal-img').attr('src', dataCollection.listImage[index].thumbnailLink);
                    }
                } else if (Math.abs(deltaY) > 100) {
                    console.log('Swipe vertical, closing modal');
                    $('#modalToggle').modal('hide');
                }
            }
        }

        function handleKeydown(e) {
            let index = parseInt($('#modal-img').attr('index'));
            if (e.key === 'ArrowLeft') {
                console.log('Arrow left');
                index = (index - 1 + dataCollection.listImage.length) % dataCollection.listImage.length;
                $('#modal-img').attr('index', index);
                $('#modal-img').attr('src', dataCollection.listImage[index].thumbnailLink);
            } else if (e.key === 'ArrowRight') {
                console.log('Arrow right');
                index = (index + 1) % dataCollection.listImage.length;
                $('#modal-img').attr('index', index);
                $('#modal-img').attr('src', dataCollection.listImage[index].thumbnailLink);
            } else if (e.key === 'ArrowUp') {
                console.log('Arrow up');
            } else if (e.key === 'ArrowDown') {
                console.log('Arrow down');
                $('#modalToggle').modal('hide');
            }
        }

        function handleWheel(e) {
            console.log('Mouse wheel event');
            let index = parseInt($('#modal-img').attr('index'));
            if (e.originalEvent.deltaY > 0) {
                console.log('Wheel down');
                index = (index + 1) % dataCollection.listImage.length;
            } else {
                console.log('Wheel up');
                index = (index - 1 + dataCollection.listImage.length) % dataCollection.listImage.length;
            }
            $('#modal-img').attr('index', index);
            $('#modal-img').attr('src', dataCollection.listImage[index].thumbnailLink);
        }

        function handleClick(e) {
            const imgWidth = $('#modal-img').width();
            const clickX = e.clientX - $('#modal-img').offset().left;

            let index = parseInt($('#modal-img').attr('index'));
            if (clickX < imgWidth / 2) {
                console.log('Click left side');
                index = (index - 1 + dataCollection.listImage.length) % dataCollection.listImage.length;
            } else {
                console.log('Click right side');
                index = (index + 1) % dataCollection.listImage.length;
            }
            $('#modal-img').attr('index', index);
            $('#modal-img').attr('src', dataCollection.listImage[index].thumbnailLink);
        }

        $('#modal-body').on('mousedown touchstart', handleStart);
        $(document).on('mousemove touchmove', handleMove);
        $(document).on('mouseup touchend', handleEnd);
        $(document).on('keydown', handleKeydown);
        $(document).on('wheel', handleWheel);
        $('#modal-img').on('click', handleClick);
    });