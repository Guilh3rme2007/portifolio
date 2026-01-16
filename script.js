function sendmensage(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name').value;
    const messageInput = document.getElementById('message').value;
    const phoneNumber = '61981577146';
    const textTemplate = `Olá, meu nome é ${nameInput}.\n${messageInput}`;
    const formattedMessage = encodeURIComponent(textTemplate);
    const url = `https://wa.me/${phoneNumber}?text=${formattedMessage}`;

    console.log(url);

    window.open(url, '_blank');
}

