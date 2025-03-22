
const modal = document.getElementById('confirm-modal');
const deletebutton = document.getElementById('delete-button');
const cancelbutton = document.getElementById('cancel-delete');

deletebutton.addEventListener('click',()=>{
    modal.style.display = 'flex';
})

cancelbutton.addEventListener('click',()=>{
    modal.style.display = 'none';
})
