<script>
	export let names;
	let selectedUser = null;
	
	function editUser(user) {
	  selectedUser = { ...user }; // Set the user to edit
	}
	
	async function submitUpdate(event) {
	  event.preventDefault(); // Prevent default form submission
	
	  const formData = new FormData(event.target); // Get form data from the form element
	  const response = await fetch('/profiles?/update', {
		method: 'POST',
		body: formData
	  });
	
	  const result = await response.json();
	  if (result.success) {
		// Update the user in the names array without reloading the page
		const updatedUser = names.find(u => u.id === selectedUser.id);
		if (updatedUser) {
		  updatedUser.name = selectedUser.name;
		  updatedUser.email = selectedUser.email;
		}
		selectedUser = null; // Reset selected user after successful update
	  } else {
		console.error('Update failed:', result.error);
	  }
	}
  </script>
  
  <div class="user-list">
	{#each names as user (user.id)}
	  <div class="user-item">
		<p>{user.name} - {user.email}</p>
		<button on:click={() => editUser(user)}>Edit</button>
	  </div>
	{/each}
  </div>
  
  {#if selectedUser}
	<form on:submit={submitUpdate}>
	  <input type="hidden" name="id" value={selectedUser.id} />
  
	  <label for="name">Name</label>
	  <input id="name" name="name" type="text" bind:value={selectedUser.name} required />
  
	  <label for="email">Email</label>
	  <input id="email" name="email" type="email" bind:value={selectedUser.email} required />
  
	  <button type="submit">Update</button>
	</form>
  {/if}
  