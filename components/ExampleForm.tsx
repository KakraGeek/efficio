import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

// Define the shape of the form data
type FormData = {
  name: string;
  email: string;
};

// ExampleForm demonstrates a custom form with validation
export default function ExampleForm() {
  // useForm manages form state and validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // This function runs when the form is submitted and valid
  const onSubmit = (data: FormData) => {
    toast.success('Form submitted successfully!');
    // alert(JSON.stringify(data, null, 2));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-sm mx-auto"
    >
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <Input
          {...register('name', { required: 'Name is required' })}
          placeholder="Enter your name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <Input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
          })}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
