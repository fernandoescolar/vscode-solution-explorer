export const PROJECT_TYPES = [
  {
    name: 'Console application',
    value: 'console',
    languages: ['C#', 'F#', 'VB']
  },
  { name: 'Class library', value: 'classlib', languages: ['C#', 'F#', 'VB'] },
  { name: 'WPF Application', value: 'wpf', languages: ['C#'] },
  { name: 'WPF Class library', value: 'wpflib', languages: ['C#'] },
  {
    name: 'WPF Custom Control Library',
    value: 'wpfcustomcontrollib',
    languages: ['C#']
  },
  {
    name: 'WPF User Control Library',
    value: 'wpfusercontrollib',
    languages: ['C#']
  },
  {
    name: 'Windows Forms (WinForms) Application',
    value: 'winforms',
    languages: ['C#']
  },
  {
    name: 'Windows Forms (WinForms) Class library',
    value: 'winformslib',
    languages: ['C#']
  },
  { name: 'Worker Service', value: 'worker', languages: ['C#'] },
  { name: 'Unit test project', value: 'mstest', languages: ['C#', 'F#', 'VB'] },
  { name: 'xUnit test project', value: 'xunit', languages: ['C#', 'F#', 'VB'] },
  {
    name: 'NUnit 3 Test Project',
    value: 'nunit',
    languages: ['C#', 'F#', 'VB']
  },
  { name: 'ASP.NET Core empty', value: 'web', languages: ['C#', 'F#'] },
  {
    name: 'ASP.NET Core Web App (Model-View-Controller)',
    value: 'mvc',
    languages: ['C#', 'F#']
  },
  { name: 'ASP.NET Core Web App', value: 'razor', languages: ['C#'] },
  { name: 'ASP.NET Core with Angular', value: 'angular', languages: ['C#'] },
  { name: 'ASP.NET Core with React.js', value: 'react', languages: ['C#'] },
  {
    name: 'ASP.NET Core with React.js and Redux',
    value: 'reactredux',
    languages: ['C#']
  },
  {
    name: 'ASP.NET Core Web API',
    value: 'webapi',
    languages: ['C#', 'F#'],
    description:
      'A project template for creating an ASP.NET Core application with an example Controller for a RESTful HTTP service. This template can also be used for ASP.NET Core MVC Views and Controllers'
  },
  { name: 'ASP.NET Core gRPC Service', value: 'grpc', languages: ['C#'] },
  { name: 'Blazor Server App', value: 'blazorserver', languages: ['C#'] },
  { name: 'Blazor WebAssembly App', value: 'blazorwasm', languages: ['C#'] },
  { name: 'Razor Class Library', value: 'razorclasslib', languages: ['C#'] }
]
