import {useMutation, useQueryClient} from "@tanstack/react-query";
import { api } from '#/lib/treaty';

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string }) =>  {
            const {data: result, error } =await api.api.me.patch(data);
            if (error) throw new Error("Failed to update profile");
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["me"]});
        },
    })
}