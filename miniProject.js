// --- Input Data ---
const taxis = [
  { id: 1, position: 5, available: true, timeRemaining: 0, totalRides: 0 },
  { id: 2, position: 12, available: true, timeRemaining: 0, totalRides: 0 },
  { id: 3, position: 20, available: true, timeRemaining: 0, totalRides: 0 },
];

let requests = [
  { reqId: 1, position: 10, duration: 3, time: 0 },
  { reqId: 2, position: 3, duration: 4, time: 2 },
  { reqId: 3, position: 18, duration: 2, time: 4 },
  { reqId: 4, position: 7, duration: 5, time: 5 },
];

// --- Helper Functions ---

function findNearestTaxi(reqPos) {
  const available = taxis.filter((t) => t.available);
  if (available.length === 0) return null;
  
  
  return available.reduce((closest, taxi) => {
    const distA = Math.abs(taxi.position - reqPos);
    const distB = Math.abs(closest.position - reqPos);
    return distA < distB ? taxi : closest;
  });
}


function assignTaxi(taxi, request) {
 
  const travelTime = Math.abs(taxi.position - request.position);
  
  taxi.available = false;
 
  taxi.timeRemaining = travelTime + request.duration; 
  taxi.targetPosition = request.position; 
  taxi.totalRides++;
  
  console.log(`
    Assigning Request ${request.reqId} (pos ${request.position}) to Taxi ${taxi.id} (pos ${taxi.position}).
  `);
  console.log(
    `  → Distance: ${travelTime} min, Ride: ${request.duration} min. Total busy time: ${taxi.timeRemaining} min.`
  );
}


function releaseTaxis() {
  const released = [];
  for (const taxi of taxis) {
    if (!taxi.available) {
      taxi.timeRemaining--; 
      if (taxi.timeRemaining <= 0) {
        taxi.available = true;
        taxi.position = taxi.targetPosition;
        released.push(taxi);
      }
    }
  }
  return released;
}

// --- Simulation ---
let timeElapsed = 0;
const waitingQueue = [];
requests.sort((a, b) => a.time - b.time);

console.log("début de la simulation...\n");

while (
  requests.length > 0 ||          
  taxis.some((t) => !t.available) || 
  waitingQueue.length > 0         
) {
  console.log(`--- Minute ${timeElapsed} ---`);


  const releasedTaxis = releaseTaxis();
  for (const taxi of releasedTaxis) {
    console.log(`
      taxi ${taxi.id} finished its ride. Now available at position ${taxi.position}.
    `);
  }

 
  const availableTaxis = taxis.filter(t => t.available);
  for (const taxi of availableTaxis) {
      if (waitingQueue.length > 0) {
         
          const nextReq = waitingQueue.shift();
          console.log(`
            taxi ${taxi.id} (now free) is taking waiting Request ${nextReq.reqId}.
          `);
          assignTaxi(taxi, nextReq);
      } else {
          break; 
      }
  }

 
  const arriving = requests.filter((r) => r.time === timeElapsed);
  for (const req of arriving) {
    const taxi = findNearestTaxi(req.position);
    if (taxi) {
      assignTaxi(taxi, req);
    } else {
      console.log(`
        Request ${req.reqId} (pos ${req.position}) → All taxis are busy. Adding to waiting queue.
     ` );
      waitingQueue.push(req);
    }
  }
  requests = requests.filter((r) => r.time !== timeElapsed); 

  timeElapsed++;
  
  if (timeElapsed > 50) { 
      console.log("Simulation stopped to prevent infinite loop.");
      break;
  }
}

// --- Rapport final ---
console.log(`\n--- Minute ${timeElapsed - 1}: Simulation Over ---`);
console.log("Toutes les courses sont terminées.");
console.log("--- Rapport final ---");
let totalRides = 0;
for (const taxi of taxis) {
  totalRides += taxi.totalRides;
  console.log(`
    Taxi ${taxi.id}: ${taxi.totalRides} courses, Final position: ${taxi.position}
  `);
}
console.log(`Total rides: ${totalRides}`);
if (waitingQueue.length > 0) {
    console.log(`WARNING: ${waitingQueue.length} requests were not served.`);
}