//Workspace Type Definitions


module.exports.workspacetype = {
  'storage': {
    name: 'storage',
    label: 'Storage',
    subtitle: 'Storage',
    description: 'Create or link Storage workspace:',
    logo: '/angular/storage/assets/images/storage.png',
    action: {default: 'list', available: ['create', 'list']}
  }
}
