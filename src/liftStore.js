let logs = []

export const getLiftLogs = () => logs

export const setLiftLogs = (next) => {
  logs = next
  window.dispatchEvent(new Event('ironline-store'))
}
