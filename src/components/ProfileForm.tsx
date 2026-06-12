import { useState } from "react";
import { useUpdateProfile } from "#/hooks/use-update-profile";

export function ProfileForm({currentName}: {currentName: string}) {
    const [name, setName] = useState(currentName);
    const updateProfile = useUpdateProfile();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile.mutate({name});
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="name" className="block test-sm font-medium">Display Name</label>
            <input 
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 ted"
            />
            <button type="submit" className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white">
                {updateProfile.isPending ? "Saving..." : "Save"}
            </button>
            {updateProfile.isError && (<p className="mt-4 text-red-500">Failed to update profile. Please try again.</p>)}
        </form>
    )
}