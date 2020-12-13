function updateStartBudget(val) {
  document.getElementById('budgetOutput').value=val; 
}

function postGame(){

  const startbudget = Number(document.getElementById("startbudget").value);

  const object = {
    "name" : document.getElementById("gameName").value,
    "budget": startbudget*1000000,
    "auction": 0,
    "auctionStarter": "",
    "players" : {}
  }

  const playercount = Number(document.getElementById("playercount").value);

  object["players"]["bank"] = {
    id : ""
  }
  for(let i = 1; i <= playercount; i++){
    object["players"]["player" + i] = {
      "id": "",
      "bet": 0
    }
  }
  
  fetch('/postGame', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      if(response.ok) {
        window.location='/joinGame';
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
}

function joinPlayer(gameid){
  const object = {
      "id" : gameid
  }

  fetch('/postPlayer', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      return response.text();
    }).then(function(data) {
      window.location='/playerView/'+data;
      return;
    });
}

function joinBank(gameid){
  const object = {
      "id" : gameid
  }

  fetch('/postBank', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      return response.text();
    }).then(function(data) {
      window.location='/bankView/'+data;
      return;
    });
}

function sendMoney(playerName, money){
  const object = {
    "gameid" : document.getElementById("gameId").value,
    "playerName" : playerName,
    "money" : money
  }

  fetch('/sendMoney', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      return;
    });
}

function transferMoney(playerName, money){
  const object = {
    "selfid" : document.getElementById("selfId").value,
    "gameid" : document.getElementById("gameId").value,
    "playerName" : playerName,
    "money" : money
  }

  fetch('/transferMoney', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      return;
    });
}

function startAuction(playerName, money){
  const object = {
    "gameid" : document.getElementById("gameId").value,
    "playerName" : playerName,
    "money" : money
  }

  fetch('/postAuction', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      return;
    });
}

function closeAuction(){
  const object = {
    "gameid" : document.getElementById("gameId").value
  }

  fetch('/closeAuction', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then(function(response) {
    return response.text();
  }).then(function(data) {
    console.log("Winner is = " + data);
    return;
  });
}

function betMoney(money){
  const object = {
    "gameid" : document.getElementById("gameId").value,
    "selfid" : document.getElementById("selfId").value,
    "money" : money
  }

  fetch('/betMoney', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
    .then(function(response) {
      return;
    });
}