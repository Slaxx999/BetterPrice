function openAlertModal(productId, productName, currentPrice) {
  document.getElementById('modal-product-id').value = productId;
  document.getElementById('modal-product-name').textContent = productName;
  document.getElementById('modal-current-price').textContent = 'RD$ ' + parseFloat(currentPrice).toFixed(2);
  document.getElementById('alertModal').classList.remove('hidden');
}

function closeAlertModal() {
  document.getElementById('alertModal').classList.add('hidden');
}

// Cerrar modal al hacer click fuera
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('alertModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAlertModal();
    });
  }
});
