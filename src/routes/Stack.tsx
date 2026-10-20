import { Navigate } from 'react-router-dom'

export default function Stack() {
  return <Navigate to={{ pathname: '/', hash: 'skills' }} replace />
}
