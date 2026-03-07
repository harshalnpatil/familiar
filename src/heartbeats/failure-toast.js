const { microcopy, formatTemplate } = require('../microcopy')

const DEFAULT_HEARTBEAT_TOPIC_LABEL = 'Heartbeat'

const normalizeTopic = (topic) => {
  const normalized = typeof topic === 'string' ? topic.trim() : ''
  return normalized.length > 0 ? normalized : DEFAULT_HEARTBEAT_TOPIC_LABEL
}

const buildHeartbeatFailureToastBody = (topic) => {
  return formatTemplate(microcopy.heartbeats.failureToast.bodyTemplate, {
    topic: normalizeTopic(topic)
  })
}

const getHeartbeatFailureToastActionLabel = () => {
  return microcopy.heartbeats.failureToast.expandFailures
}

module.exports = {
  buildHeartbeatFailureToastBody,
  getHeartbeatFailureToastActionLabel
}
