from django.core.management.base import BaseCommand
from apps.orders.models import Job

class Command(BaseCommand):
    help = 'Backfills missing job_number for existing Jobs'

    def handle(self, *args, **kwargs):
        jobs_without_number = Job.objects.filter(job_number__isnull=True).order_by('created_at')
        
        if not jobs_without_number.exists():
            self.stdout.write(self.style.SUCCESS('No jobs found with missing job_number.'))
            return

        count = jobs_without_number.count()
        self.stdout.write(f'Found {count} jobs without job_number. Starting backfill...')

        # Find the current max job number or start at 1000
        last_job = Job.objects.order_by('-job_number').first()
        current_number = last_job.job_number if (last_job and last_job.job_number) else 1000

        for job in jobs_without_number:
            current_number += 1
            job.job_number = current_number
            job.save(update_fields=['job_number'])
            self.stdout.write(f'Assigned Job #{job.job_number} to Job {job.id}')

        self.stdout.write(self.style.SUCCESS(f'Successfully backfilled {count} jobs.'))
