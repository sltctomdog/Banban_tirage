let fileName = null
const valueToReduce = 10;

$(document).ready(function() {
    initEvents();
    displayParticipants([]);
    displayWinners([]);
});

function initEvents() {
    $('#file-input').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const participants = content.split('\n').filter(name => name.trim() !== '');
                fileName = file.name.split('.').slice(0, -1).join('.');

                updateClassFile(participants);

                displayParticipants(participants);
            };
            reader.readAsText(file);
        }
    });

    $('#draw').on('click', function() {
        drawWinners();
    });

    $('#reset').on('click', function() {
       resetPercentages();
    });
}

function displayParticipants(participants) {
    const participantsUl = $('#participants');
    const participantsDiv = participantsUl.parents('.card');
    const resetButton = $('#reset');

    participantsUl.empty();

    participants.forEach(name => {
        participantsUl.append(`<li class="list-group-item list-group-item-primary">${name}</li>`);
    });

    participantsDiv.show();
    resetButton.show();
    if (participants.length <= 0) {
        participantsDiv.hide();
        resetButton.hide();
    }
    displayDrawSection();
}

function displayDrawSection() {
    const sortSection = $('#sort-section');
    sortSection.show();
    if ($('#participants').children().length <= 0) {
        sortSection.hide();
    }
}

function drawWinners() {
    const drawNumber = $('#winner-number').val();
    const winners = [];
    let participantsData = JSON.parse(localStorage.getItem(fileName)) || { participants: [] };
    let participantsList = participantsData.participants;

    const weightedParticipants = [];
    participantsList.forEach(participant => {
        for (let i = 0; i < participant.value; i++) {
            weightedParticipants.push(participant.name);
        }
    });

    while (winners.length < drawNumber) {
        const index = Math.floor(Math.random() * weightedParticipants.length);
        const winner = weightedParticipants.splice(index, 1)[0];
        if (!winners.includes(winner)) {
            winners.push(winner);
        }
    }

    updateWinnersStorage(winners);
    displayWinners(winners);
}

function displayWinners(winners) {
    const winnersUl = $('#winners');
    const winnersSection = winnersUl.parents('.card');

    winnersUl.empty();

    winners.forEach(name => {
        winnersUl.append(`<li class="list-group-item list-group-item-primary">${name}</li>`);
    });

    winnersSection.show();
    if (winners.length <= 0) {
        winnersSection.hide();
    }
}

function updateWinnersStorage(winners) {
    let participantsData = JSON.parse(localStorage.getItem(fileName)) || { participants: [] };
    let participants = participantsData.participants;

    winners.forEach(winner => {
        const participant = participants.find(p => p.name === winner);
        if (participant) {
            participant.value = participant.value - valueToReduce;
            if (participant.value < 0) {
                participant.value = 0;
            }
        }
    });

    localStorage.setItem(fileName, JSON.stringify(participantsData));
}

function updateClassFile(participants) {
    participants = participants.map(participant => ({
        name: participant.replace(/[\n\r]/g, ''),
        value: 100
    }));

    let banbanClassFile = localStorage.getItem(fileName);

    if (!banbanClassFile) {
        banbanClassFile = { participants };
    } else {
        banbanClassFile = JSON.parse(banbanClassFile);
        participants.forEach(participant => {
            if (!banbanClassFile.participants.find(p => p.name === participant.name)) {
                banbanClassFile.participants.push(participant);
            }
        });
    }

    localStorage.setItem(fileName, JSON.stringify(banbanClassFile));
}

function resetPercentages() {
    let participantsData = JSON.parse(localStorage.getItem(fileName)) || { participants: [] };
    let participants = participantsData.participants;

    participants.forEach(participant => {
        participant.value = 100;
    });

    localStorage.setItem(fileName, JSON.stringify(participantsData));
}