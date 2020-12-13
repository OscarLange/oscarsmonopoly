function updateStartBudget(val) {
  document.getElementById('budgetOutput').value=val; 
}

function postGame(){
  const object = {
    "name" : document.getElementById("gameName").value,
    "players" : {}
  }

  const playercount = Number(document.getElementById("playercount").value);
  const startbudget = Number(document.getElementById("startbudget").value);

  for(let i = 1; i <= playercount; i++){
    object["players"]["player" + i] = {
      "budget": startbudget*1000000,
      "id": ""
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
        console.log('Click was recorded');
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
    window.location='/';
}
