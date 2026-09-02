---
description: Design rule for alerts and modals in the KoneKta mobile app
---
# Always Use Custom Cards for Alerts

The user strongly prefers custom UI cards over native system alerts (`window.alert` or `Alert.alert`). 
NEVER use native alerts for showing errors, warnings, or successes to the user.

Instead, ALWAYS use a custom React Native `<Modal>` with a beautifully styled "Card" inside it. 
This card should have:
- A semi-transparent overlay background (`rgba(0,0,0,0.5)`)
- A white card container with rounded corners (e.g. `borderRadius: 24`)
- An icon (from `@expo/vector-icons/Ionicons`) inside a rounded colored background
- A clear Title and Description text
- A primary button to dismiss the modal.

Example of what to avoid:
```javascript
// DO NOT DO THIS
if (error) {
  if (Platform.OS === 'web') window.alert(error.message);
  else Alert.alert('Erro', error.message);
}
```

If you are modifying a file that currently uses `Alert.alert`, you MUST proactively refactor it to use a custom Modal state instead.
