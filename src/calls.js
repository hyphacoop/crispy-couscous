const calls = {}

function createRecordOfOpenCall(id) {
  calls[id] = true
}

function checkForOpenCall(id) {
  return calls[id]
}

export { createRecordOfOpenCall, checkForOpenCall }
